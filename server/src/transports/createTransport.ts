import {
  DtlsParameters,
  IceCandidate,
  IceParameters,
} from "mediasoup/node/lib/WebRtcTransportTypes";
import { router } from "../app";

const createTransport = async (
  callback: (
    params:
      | {
          id: string;
          iceParameters: IceParameters;
          iceCandidates: IceCandidate[];
          dtlsParameters: DtlsParameters;
        }
      | {
          error: string;
        }
  ) => void
) => {
  try {
    const webRtcTransportOptions = {
      listenIps: [
        {
          ip: "127.0.0.1",
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    };

    console.log("transport creating", router);

    const transport = await router.createWebRtcTransport(
      webRtcTransportOptions
    );

    transport.on("dtlsstatechange", (dtlsState) => {
      if (dtlsState === "closed") {
        transport.close();
      }
    });

    transport.on("@close", () => {
      console.log("Transport closed");
    });

    callback({
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    });

    return transport;
  } catch (error) {
    console.error("Error creating transport:", error);
    callback({ error: "Error creating transport" });
  }
};

export default createTransport;
