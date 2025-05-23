import type { Device, DtlsParameters, Transport } from "mediasoup-client/types";

import type { IceCandidate } from "mediasoup-client/types";

import type { IceParameters } from "mediasoup-client/types";
import { socket } from "./socket";

interface CreateProduceTransportProps {
  device: Device;
  roomId: string;
  setProduceTransport: (transport: Transport) => void;
}

const createProduceTransport = ({
  roomId,
  device,
  setProduceTransport,
}: CreateProduceTransportProps) => {
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
      console.log({ transport }, "Produce Transport Created");
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
    }
  );
};

export default createProduceTransport;
