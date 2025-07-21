import {
  DtlsParameters,
  IceCandidate,
  IceParameters,
} from "mediasoup/node/lib/WebRtcTransportTypes";
import { rooms } from "../app";

const createTransport = async (
  roomId: string,
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
  console.log(process.env.LISTEN_IP, process.env.ANNOUNCED_IP, "HEHE");
  try {
    const webRtcTransportOptions = {
      listenIps: [
        {
          ip: process.env.LISTEN_IP || "0.0.0.0",
          announcedIp: process.env.ANNOUNCED_IP || "0.0.0.0",
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    };

    const room = rooms.get(roomId);
    if (!room) {
      return callback({
        error: "Room not found",
      });
    }

    const transport = await room.router?.createWebRtcTransport(
      webRtcTransportOptions
    );

    if (!transport) {
      return callback({
        error: "Failed to create transport",
      });
    }

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
