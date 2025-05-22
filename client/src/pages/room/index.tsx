import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Video, VideoOff } from "lucide-react";
import { redirect, useParams } from "react-router";
import type {
  AppData,
  ConsumerOptions,
  DtlsParameters,
  IceCandidate,
  IceParameters,
  RtpCapabilities,
} from "mediasoup-client/types";
import { Device } from "mediasoup-client";
import useRoomStore from "@/store/room";
import useTransportsStore from "@/store/transports";
import useProducersStore from "@/store/producers";
import { socket } from "@/lib/socket";

export default function Room() {
  const params = useParams();
  const roomId = params.roomId as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  const { setRtpCapabilities, setDevice, device, rtpCapabilities } =
    useRoomStore();
  const { setProduceTransport, setReceiveTransport, receiveTransport } =
    useTransportsStore();
  const { setVideoProducer } = useProducersStore();

  const [videoConf, setVideoConf] = useState({
    encoding: [
      { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" },
      { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" },
      { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" },
    ],
    codecOptions: { videoGoogleStartBitrate: 1000 },
  });

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [disableCamera, setDisableCamera] = useState(true);

  const toggleCamera = async () => {
    if (!device) return;
    setIsCameraOn(!isCameraOn);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      let closureVideoConf;
      if (videoRef.current) {
        const track = stream.getVideoTracks()[0];

        videoRef.current.srcObject = stream;
        closureVideoConf = { ...videoConf, track };
        setVideoConf((current) => ({ ...current, track }));
      }

      if (!closureVideoConf) return;

      socket.emit(
        "createTransport",
        { sender: true, roomId },
        async (params: {
          id: string;
          iceParameters: IceParameters;
          iceCandidates: IceCandidate[];
          dtlsParameters: DtlsParameters;
          error?: string;
        }) => {
          if (params.error) {
            console.error(params.error);
            return;
          }

          const transport = device.createSendTransport(params);
          setProduceTransport(transport);

          transport.on(
            "connect",
            async ({ dtlsParameters }, callback, errorBack) => {
              try {
                socket.emit("connectProducerTransport", {
                  dtlsParameters,
                  roomId,
                });
                callback();
              } catch (error) {
                errorBack(error as Error);
              }
            }
          );

          transport.on("produce", (params, callback, errorBack) => {
            const { kind, rtpParameters } = params;

            console.log("Producing");

            try {
              socket.emit(
                "transport-produce",
                { kind, rtpParameters, roomId },
                ({ id }: { id: string }) => {
                  console.log("Server producer created", { id });
                  callback({ id });
                }
              );
            } catch (error) {
              errorBack(error as Error);
            }
          });

          const localProducer = await transport.produce(closureVideoConf);
          setVideoProducer(localProducer);

          console.log("Local producer created", localProducer);
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  // const createReceiveTransport = useCallback(() => {
  //   if (!roomId || !device) return;

  //   socket.emit(
  //     "createTransport",
  //     { sender: false, roomId },
  //     (params: {
  //       id: string;
  //       iceParameters: IceParameters;
  //       iceCandidates: IceCandidate[];
  //       dtlsParameters: DtlsParameters;
  //       error: string;
  //     }) => {
  //       if (params.error) {
  //         return console.log(params.error);
  //       }

  //       const transport = device.createRecvTransport(params);
  //       setReceiveTransport(transport);

  //       transport.on("connect", ({ dtlsParameters }, callback, errorBack) => {
  //         try {
  //           socket.emit(
  //             "connectConsumerTransport",
  //             {
  //               dtlsParameters,
  //               roomId,
  //             },
  //             (params: { message: string }) => {
  //               if (params.message) {
  //                 console.log(params.message);
  //               }
  //             }
  //           );
  //           callback();
  //         } catch (error) {
  //           errorBack(error as Error);
  //         }
  //       });
  //     }
  //   );
  // }, [roomId, device, setReceiveTransport]);

  const consumeMedia = () => {
    if (!device) return;
    socket.emit(
      "getOtherProducers",
      { roomId },
      async ({
        producers,
        message,
      }: {
        producers: string[];
        message?: string;
      }) => {
        if (message) {
          console.log(message);
        }

        if (!producers.length) return;

        producers.forEach((producerId) => {
          socket.emit(
            "consumeProducer",
            {
              rtpCapabilities,
              roomId,
              producerId,
              kind: "video",
            },
            async (consumer: ConsumerOptions<AppData> & { error?: string }) => {
              if (consumer.error) {
                return console.log(consumer.error);
              }
              const localConsumer = await receiveTransport?.consume(consumer);
              if (localConsumer) {
                const { track } = localConsumer;

                if (remoteRef.current) {
                  remoteRef.current.srcObject = new MediaStream([track]);
                }

                console.log({ track });

                // socket.emit("resumePausedConsumer", {
                //   producerId,
                //   roomId,
                // });
              }
            }
          );
        });
      }
    );
  };

  /* Load Router Setup */
  useEffect(() => {
    if (!roomId) return;
    socket.emit(
      "getRouterRtpCapabilities",
      { roomId },
      async ({
        error,
        rtpCapabilities,
      }: {
        error: string;
        rtpCapabilities: RtpCapabilities;
      }) => {
        if (!error) {
          setRtpCapabilities(rtpCapabilities);

          const device = new Device();
          await device.load({
            routerRtpCapabilities: rtpCapabilities,
          });
          setDevice(device);
          setDisableCamera(false);

          socket.emit(
            "createTransport",
            { sender: false, roomId },
            (params: {
              id: string;
              iceParameters: IceParameters;
              iceCandidates: IceCandidate[];
              dtlsParameters: DtlsParameters;
              error: string;
            }) => {
              if (params.error) {
                return console.log(params.error);
              }

              const transport = device.createRecvTransport(params);
              setReceiveTransport(transport);

              console.log({ transport }, "Receive Transport Created");

              transport.on(
                "connect",
                ({ dtlsParameters }, callback, errorBack) => {
                  try {
                    socket.emit(
                      "connectConsumerTransport",
                      {
                        dtlsParameters,
                        roomId,
                      },
                      (params: { message: string }) => {
                        if (params.message) {
                          console.log(params.message);
                        }
                      }
                    );
                    callback();
                  } catch (error) {
                    errorBack(error as Error);
                  }
                }
              );
            }
          );
        }
      }
    );
  }, [roomId, setRtpCapabilities, setDevice, setReceiveTransport]);

  useEffect(() => {
    const handleNewProducer = async ({
      producerId,
      kind,
    }: {
      producerId: string;
      kind: string;
    }) => {
      console.log("New producer", { producerId, kind });

      // Make sure we have all required components
      if (!receiveTransport || !rtpCapabilities) {
        console.log("Waiting for transport or capabilities...");
        return;
      }

      try {
        socket.emit(
          "consumeProducer",
          {
            rtpCapabilities,
            roomId,
            producerId,
            kind,
          },
          async (consumer: ConsumerOptions<AppData> & { error?: string }) => {
            if (consumer.error) {
              console.error("Consumer error:", consumer.error);
              return;
            }

            try {
              const localConsumer = await receiveTransport.consume(consumer);
              if (localConsumer) {
                const { track } = localConsumer;

                if (remoteRef.current) {
                  remoteRef.current.srcObject = new MediaStream([track]);
                }

                console.log("Successfully consumed track:", { track });

                // Resume the consumer
                socket.emit("resumePausedConsumer", {
                  producerId,
                  roomId,
                });
              }
            } catch (error) {
              console.error("Error consuming:", error);
            }
          }
        );
      } catch (error) {
        console.error("Error in handleNewProducer:", error);
      }
    };

    socket.on("new-producer", handleNewProducer);

    return () => {
      socket.off("new-producer", handleNewProducer);
    };
  }, [receiveTransport, roomId, rtpCapabilities]);

  if (!roomId) {
    redirect("/setup");
    return <div>Room not found</div>;
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <video ref={remoteRef} id="remotevideo" autoPlay playsInline />
      <video ref={videoRef} id="localvideo" autoPlay playsInline />

      {/* Main content area - can be extended with additional elements later */}

      {/* Control bar - can be extended with additional controls later */}
      <div className="flex h-16 items-center justify-center border-t border-gray-800 bg-gray-950 px-4">
        <div className="flex items-center gap-2">
          {/* <Button onClick={createReceiveTransport}>
            Create Receive Transport
          </Button> */}

          <Button onClick={consumeMedia}> Consume Media </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={disableCamera}
                  variant={isCameraOn ? "default" : "outline"}
                  size="icon"
                  className={`rounded-full ${
                    isCameraOn
                      ? "bg-green-600 hover:bg-green-700"
                      : "border-gray-700 bg-gray-900 hover:bg-gray-800"
                  }`}
                  onClick={toggleCamera}
                >
                  {isCameraOn ? (
                    <Video className="h-5 w-5 text-white" />
                  ) : (
                    <VideoOff className="h-5 w-5 text-gray-300" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {isCameraOn ? "Turn off camera" : "Turn on camera"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
