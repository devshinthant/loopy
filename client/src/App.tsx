import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { Button } from "./components/ui/button";
import { Device, type Device as DeviceType } from "mediasoup-client";
import type {
  DtlsParameters,
  IceCandidate,
  IceParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
  Transport,
} from "mediasoup-client/types";

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [params, setParams] = useState({
    encoding: [
      { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" }, // Lowest quality layer
      { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" }, // Middle quality layer
      { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" }, // Highest quality layer
    ],
    codecOptions: { videoGoogleStartBitrate: 1000 }, // Initial bitrate
  });

  const [device, setDevice] = useState<DeviceType>();
  const [socket, setSocket] = useState<Socket>();

  const [rtpCapabilities, setRtpCapabilities] = useState<RtpCapabilities>();

  const [producerTransport, setProducerTransport] = useState<Transport>();
  const [consumerTransport, setConsumerTransport] = useState<Transport>();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        const track = stream.getVideoTracks()[0];
        videoRef.current.srcObject = stream;
        setParams((current) => ({ ...current, track }));
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const getRtpCapabilities = () => {
    if (!socket) return;
    socket.emit(
      "getRouterRtpCapabilities",
      (data: { rtpCapabilities: RtpCapabilities }) => {
        console.log(data);
        setRtpCapabilities(data.rtpCapabilities);
      }
    );
  };

  const createDevice = async () => {
    if (!socket || !rtpCapabilities) {
      return console.log("No socket or rtpCapabilities");
    }

    try {
      const device = new Device();
      await device.load({
        routerRtpCapabilities: rtpCapabilities,
      });
      console.log({ device });

      setDevice(device);
    } catch (error) {
      console.error("Error creating device:", error);
    }
  };

  const createProducerTransport = async () => {
    if (!socket || !device) {
      return console.log("No socket or device");
    }

    socket.emit(
      "createTransport",
      { sender: true },
      (params: {
        id: string;
        iceParameters: IceParameters;
        iceCandidates: IceCandidate[];
        dtlsParameters: DtlsParameters;
        error?: string;
      }) => {
        if (params.error) {
          return console.log(params.error);
        }

        const transport = device.createSendTransport(params);
        setProducerTransport(transport);

        console.log({ createTrans: transport });

        transport.on(
          "connect",
          async ({ dtlsParameters }, callback, errorBack) => {
            console.log("connect run");

            try {
              socket.emit("connectProducerTransport", { dtlsParameters });
              callback();
            } catch (error) {
              errorBack(error as Error);
            }
          }
        );

        transport.on("produce", (params, callback, errorBack) => {
          const { kind, rtpParameters } = params;
          try {
            socket.emit(
              "transport-produce",
              { kind, rtpParameters },
              ({ id }: { id: string }) => {
                console.log("Server producer created", { id });

                callback({ id });
              }
            );
          } catch (error) {
            errorBack(error as Error);
          }
        });
      }
    );
  };

  const connectProducerTransport = async () => {
    if (!socket || !producerTransport) {
      return console.log("No socket or producer transport");
    }

    try {
      const localProducer = await producerTransport.produce(params);

      localProducer.on("transportclose", () => {
        console.log("Producer transport closed");
        localProducer.close();
      });

      localProducer.on("trackended", () => {
        console.log("Producer transport ended");
        localProducer.close();
      });
    } catch (error) {
      console.error("Error connecting producer transport:", error);
    }
  };

  const createReceiveTransport = async () => {
    if (!socket || !device) {
      return console.log("No socket or device");
    }

    socket.emit(
      "createTransport",
      { sender: false },
      (params: {
        id: string;
        iceParameters: IceParameters;
        iceCandidates: IceCandidate[];
        dtlsParameters: DtlsParameters;
        error?: string;
      }) => {
        if (params.error) {
          return console.log(params.error);
        }

        const transport = device.createRecvTransport(params);
        setConsumerTransport(transport);

        console.log({ consume: transport });

        transport.on("connect", ({ dtlsParameters }, callback, errorBack) => {
          console.log("connect consume run");

          try {
            socket.emit("connectConsumerTransport", { dtlsParameters });
            callback();
          } catch (error) {
            errorBack(error as Error);
          }
        });
      }
    );
  };

  const consumeMedia = async () => {
    if (!socket || !consumerTransport) {
      return console.log("No socket or consumer transport");
    }

    socket.emit(
      "consumeMedia",
      { rtpCapabilities },
      async (params: {
        producerId: string;
        id: string;
        kind: MediaKind;
        rtpParameters: RtpParameters;
      }) => {
        console.log({ con: params });

        const consumer = await consumerTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
        });

        const { track } = consumer;

        console.log({ track });

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = new MediaStream([track]);
        }

        socket.emit("resumePausedConsumer", () => {});
      }
    );
  };

  useEffect(() => {
    const socket = io("http://localhost:4000/mediasoup");

    setSocket(socket);
    socket.on("connection-success", (data) => {
      console.log(data);
      // startCamera();
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} id="localvideo" autoPlay playsInline />
      <video ref={remoteVideoRef} id="remotevideo" autoPlay playsInline />

      <Button onClick={startCamera}>Start Camera</Button>

      <Button onClick={getRtpCapabilities}> Get RTP CAPABILITIES </Button>
      <Button onClick={createDevice}>Create Device</Button>
      <Button onClick={createProducerTransport}>
        Create Producer Transport
      </Button>

      <Button onClick={connectProducerTransport}>
        Connect Producer Transport
      </Button>

      <Button onClick={createReceiveTransport}>Create Receive Transport</Button>

      <Button onClick={consumeMedia}>Consume Media</Button>
    </div>
  );
}

export default App;
