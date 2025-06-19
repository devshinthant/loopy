import { cn } from "@/lib/utils";
import useLocalStreamStore from "@/store/local-streams";
import useRemoteScreenStreamStore from "@/store/remote-screen-stream";
import SpeakingIndicator from "./SpeakingIndicator";
import useRemoteAudioStreamStore from "@/store/remote-audio-streams";

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
        }
      )}
    >
      {children}
      {audioStream && !audioStream.paused && (
        <SpeakingIndicator stream={audioStream?.stream} />
      )}
    </div>
  );
}
