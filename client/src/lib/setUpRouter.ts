import type { DtlsParameters } from "mediasoup-client/types";
import type { IceCandidate } from "mediasoup-client/types";
import type { IceParameters } from "mediasoup-client/types";
import { Device } from "mediasoup-client";
import type {
  Device as DeviceType,
  RtpCapabilities,
  Transport,
} from "mediasoup-client/types";
import { socket } from "./socket";

interface SetUpRouter {
  roomId: string;
  setRtpCapabilities: (rtpCapabilities: RtpCapabilities) => void;
  setDevice: (device: DeviceType) => void;
  setReceiveTransport: (receiveTransport: Transport) => void;
}

const setUpRouter = ({
  roomId,
  setDevice,
  setRtpCapabilities,
  setReceiveTransport,
}: SetUpRouter) => {
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

            socket.emit("giveMeOthers", {
              roomId,
            });
          }
        );
      }
    }
  );
};

export default setUpRouter;
