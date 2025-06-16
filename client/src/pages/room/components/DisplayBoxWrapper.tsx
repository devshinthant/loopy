import { useSpeakingDetector } from "@/hooks/useSpeakingDetector";
import { cn } from "@/lib/utils";
import useLocalStreamStore from "@/store/local-streams";
import useRemoteAudioStreamStore from "@/store/remote-audio-streams";
import useRemoteScreenStreamStore from "@/store/remote-screen-stream";

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

  return (
    <div
      className={cn(
        "w-full rounded-md bg-black overflow-hidden relative h-full transition-all duration-300",
        {
          "col-span-1": col === 1,
          "col-span-2": col === 2,
          "col-span-3": col === 3,
          "col-span-4": col === 4,
          "h-[20dvh]": localScreenStream || remoteScreenStream?.stream,
        }
      )}
    >
      {children}
      <SpeakingIndicator userId={data.id} />
    </div>
  );
}

const SpeakingIndicator = ({ userId }: { userId: string }) => {
  const { remoteAudioStreams } = useRemoteAudioStreamStore();
  const audioStream = remoteAudioStreams?.find(
    (stream) => stream.emitterId === userId
  );
  const isSpeaking = useSpeakingDetector(audioStream?.stream || null);

  if (!audioStream || audioStream?.paused) return null;

  return (
    <div className="absolute top-1 right-4">
      <div className="w-full h-8 gap-[1.5px] flex items-end justify-between">
        <div
          className={cn(
            "scale-y-[0.4] h-full w-[1.5px] bg-white/60 rounded-[8px] transition-all duration-300 ease-in-out",
            {
              "animate-quiet": isSpeaking,
              "opacity-40": !isSpeaking,
            }
          )}
        ></div>
        <div
          className={cn(
            "scale-y-[0.4] h-full w-[1.5px] bg-white/60 rounded-[8px] transition-all duration-300 ease-in-out",
            {
              "animate-medium": isSpeaking,
              "opacity-40": !isSpeaking,
            }
          )}
        ></div>
        <div
          className={cn(
            "scale-y-[0.4] h-full w-[1.5px] bg-white/60 rounded-[8px] transition-all duration-300 ease-in-out",
            {
              "animate-quiet": isSpeaking,
              "opacity-40": !isSpeaking,
            }
          )}
        ></div>
        <div
          className={cn(
            "scale-y-[0.4] h-full w-[1.5px] bg-white/60 rounded-[8px] transition-all duration-300 ease-in-out",
            {
              "animate-loud": isSpeaking,
              "opacity-40": !isSpeaking,
            }
          )}
        ></div>
        <div
          className={cn(
            "scale-y-[0.4] h-full w-[1.5px] bg-white/60 rounded-[8px] transition-all duration-300 ease-in-out",
            {
              "animate-quiet": isSpeaking,
              "opacity-40": !isSpeaking,
            }
          )}
        ></div>
      </div>
    </div>
  );
};
