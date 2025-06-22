import { cn } from "@/lib/utils";
import useLocalStreamStore from "@/store/local-streams";
import useRemoteScreenStreamStore from "@/store/remote-screen-stream";
import SpeakingIndicator from "./SpeakingIndicator";
import useRemoteAudioStreamStore from "@/store/remote-audio-streams";
import useRaiseHandStore from "@/store/raiseHand";
import { Hand } from "lucide-react";

export default function DisplayBoxWrapper({
  data,
  children,
  col,
}: {
  data: UserData;
  children: React.ReactNode;
  col: number;
}) {
  const { localScreenStream } = useLocalStreamStore();
  const { remoteScreenStream } = useRemoteScreenStreamStore();

  const { remoteAudioStreams } = useRemoteAudioStreamStore();
  const audioStream = remoteAudioStreams?.find(
    (stream) => stream.emitterId === data.id
  );

  const { isHandRaised } = useRaiseHandStore();

  return (
    <div
      className={cn(
        "w-full rounded-md  bg-black overflow-hidden relative h-full",
        {
          "col-span-1": col === 1,
          "col-span-2": col === 2,
          "col-span-3": col === 3,
          "col-span-4": col === 4,
          "max-h-[20dvh]": localScreenStream || remoteScreenStream?.stream,
          "ring-2 ring-yellow-400": isHandRaised(data.id),
        }
      )}
    >
      {children}
      {isHandRaised(data.id) && (
        <div className="absolute top-3 left-3 bg-yellow-400 text-gray-900 p-2 rounded-full animate-bounce shadow-lg">
          <Hand className="w-4 h-4" />
        </div>
      )}
      {audioStream && !audioStream.paused && (
        <SpeakingIndicator stream={audioStream?.stream} />
      )}
    </div>
  );
}
