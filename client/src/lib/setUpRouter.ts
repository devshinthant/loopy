import { Device } from "mediasoup-client";
import type {
  Device as DeviceType,
  RtpCapabilities,
  Transport,
} from "mediasoup-client/types";
import { socket } from "./socket";
import createReceiveTransport from "./createReceiveTransport";
import createProduceTransport from "./createProduceTransport";

interface SetUpRouter {
  roomId: string;
  setRtpCapabilities: (rtpCapabilities: RtpCapabilities) => void;
  setDevice: (device: DeviceType) => void;
  setReceiveTransport: (receiveTransport: Transport) => void;
  setProduceTransport: (produceTransport: Transport) => void;
}

/**
 * This function is used to set up the router and the transports.
 * It is called when the user enters a room.
 * It emits a request to the server to get the router's RTP capabilities.
 * Once the RTP capabilities are received, it creates a new Device.
 * It then creates a new produce transport and a new receive transport.
 *
 * @param param0
 */

const setUpRouter = ({
  roomId,
  setDevice,
  setRtpCapabilities,
  setReceiveTransport,
  setProduceTransport,
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

        createProduceTransport({
          roomId,
          device,
          setProduceTransport,
        });

        createReceiveTransport({
          roomId,
          device,
          setReceiveTransport,
        });
      }
    }
  );
};

export default setUpRouter;
