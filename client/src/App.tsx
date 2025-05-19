import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { Button } from "./components/ui/button";
import { Device, type Device as DeviceType } from "mediasoup-client";
import type { RtpCapabilities } from "mediasoup-client/types";

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

  const [producerTransport, setProducerTransport] = useState<unknown>();
  const [consumerTransport, setConsumerTransport] = useState<unknown>();

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

      setDevice(device);
    } catch (error) {
      console.error("Error creating device:", error);
    }
  };

  useEffect(() => {
    const socket = io("http://localhost:4000/mediasoup");

    setSocket(socket);
    socket.on("connection-success", (data) => {
      console.log(data);
      startCamera();
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      {/* <video ref={videoRef} id="localvideo" autoPlay playsInline /> */}
      <video ref={remoteVideoRef} id="remotevideo" autoPlay playsInline />
      <Button onClick={getRtpCapabilities}> Get RTP CAPABILITIES </Button>

      <Button onClick={createDevice}>Create Device</Button>
    </div>
  );
}

export default App;
