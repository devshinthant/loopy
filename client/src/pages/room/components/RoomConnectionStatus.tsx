import { useRoomConnectionQuality } from "@/hooks/useRoomConnectionQuality";
import useTransportsStore from "@/store/transports";
import { Wifi } from "lucide-react";
import type { Transport } from "mediasoup-client/types";

type RoomConnectionStatus = "good" | "fair" | "poor";

export default function RoomConnectionStatus() {
  const { receiveTransport, produceTransport } = useTransportsStore();

  const roomQuality = useRoomConnectionQuality(
    [receiveTransport, produceTransport].filter(Boolean) as Transport[]
  );

  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-green-500/10 backdrop-blur-sm ring-1 ring-green-500/20">
        <Wifi className="h-4 w-4 text-green-400" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-200 capitalize">
          {roomQuality}
        </span>
        <span className="text-xs text-gray-400">Connection</span>
      </div>
    </div>
  );
}
