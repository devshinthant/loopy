import { Button } from "@/components/ui/button";
import VideoOff from "@/components/VideoOff";
import { cn } from "@/lib/utils";
import useLocalStreamStore from "@/store/local-streams";
import useRemoteAudioStreamStore from "@/store/remote-audio-streams";
import useRemoteScreenStreamStore from "@/store/remote-screen-stream";
import useRemoteStreamStore from "@/store/remote-streams";
import { MicOff } from "lucide-react";

export default function DisplayBox({
  data,
  col,
}: {
  data: UserData;
  col: number;
}) {
  const { remoteStreams } = useRemoteStreamStore();
  const videoStream = remoteStreams?.find(
    (stream) => stream.emitterId === data.id
  );

  const { remoteAudioStreams } = useRemoteAudioStreamStore();
  const audioStream = remoteAudioStreams?.find(
    (stream) => stream.emitterId === data.id
  );

  const { localScreenStream } = useLocalStreamStore();
  const { remoteScreenStream } = useRemoteScreenStreamStore();

  return (
    <div
      className={cn(
        "w-full rounded-md bg-transparent overflow-hidden relative h-full",
        {
          "col-span-1": col === 1,
          "col-span-2": col === 2,
          "col-span-3": col === 3,
          "col-span-4": col === 4,
          "h-[20dvh]": localScreenStream || remoteScreenStream?.stream,
        }
      )}
    >
      {videoStream && !videoStream?.paused && (
        <video
          ref={(el) => {
            if (el && videoStream) el.srcObject = videoStream.stream;
          }}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          muted={false}
          style={{
            filter: videoStream?.paused
              ? "grayscale(100%) brightness( 0.5)"
              : "none",
          }}
        />
      )}

      {(!videoStream || videoStream?.paused) && (
        <VideoOff local={false} imageUrl={data.imageUrl || ""} />
      )}

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
        {data.name || "Guest"}
      </p>
    </div>
  );
}
