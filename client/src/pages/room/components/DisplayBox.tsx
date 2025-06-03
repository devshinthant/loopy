import { Button } from "@/components/ui/button";
import VideoOff from "@/components/VideoOff";
import { getProducerInfo } from "@/lib/getProducerInfo";
import useRemoteAudioStreamStore from "@/store/remote-audio-streams";
import type { RemoteStream } from "@/store/remote-streams";
import { MicOff } from "lucide-react";

import { useExtractColors } from "react-extract-colors";

export default function DisplayBox({
  stream,
  paused,
  producerId,
}: RemoteStream) {
  const userInfo = getProducerInfo({ producerId });
  const { colors } = useExtractColors(userInfo?.imageUrl || "");
  const gradientBg = `linear-gradient(135deg, ${colors[0]}, ${
    colors[1] || colors[0]
  })`;
  const { remoteAudioStreams } = useRemoteAudioStreamStore();
  const audioStream = remoteAudioStreams?.find(
    (stream) => stream.emitterId === userInfo?.id
  );

  return (
    <div
      key={stream.id}
      style={{
        background: paused ? gradientBg : "transparent",
      }}
      className="w-full rounded-md overflow-hidden relative h-full"
    >
      {!paused && (
        <video
          ref={(el) => {
            if (el) el.srcObject = stream;
          }}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          muted={false}
          style={{
            filter: paused ? "grayscale(100%) brightness( 0.5)" : "none",
          }}
        />
      )}

      {paused && <VideoOff local={false} imageUrl={userInfo?.imageUrl || ""} />}

      {(!audioStream || audioStream?.paused) && (
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            className="bg-gray-900 text-gray-300 px-2 py-1 rounded-md"
          >
            <MicOff className="w-4 h-4" />
          </Button>
        </div>
      )}

      <p className="absolute text-white bottom-2 left-2 text-xs font-semibold">
        {userInfo?.name || "Guest"}
      </p>
    </div>
  );
}
