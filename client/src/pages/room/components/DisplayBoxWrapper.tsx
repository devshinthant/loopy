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
}: {
  data: UserData;
  children: React.ReactNode;
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
        "rounded-md col-span-1  bg-black overflow-hidden relative h-full",
        {
          "max-h-[20dvh] shrink-0":
            localScreenStream || remoteScreenStream?.stream,
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
