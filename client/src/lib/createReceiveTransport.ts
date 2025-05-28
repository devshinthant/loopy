import type { Device, DtlsParameters, Transport } from "mediasoup-client/types";

import type { IceCandidate } from "mediasoup-client/types";

import type { IceParameters } from "mediasoup-client/types";
import { socket } from "./socket";

interface CreateReceiveTransportProps {
  roomId: string;
  device: Device;
  setReceiveTransport: (transport: Transport) => void;
}

const createReceiveTransport = ({
  roomId,
  device,
  setReceiveTransport,
}: CreateReceiveTransportProps) => {
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

      transport.on("connect", ({ dtlsParameters }, callback, errorBack) => {
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
      });
    }
  );
};

export default createReceiveTransport;
