import { useSpeakingDetector } from "@/hooks/useSpeakingDetector";
import { cn } from "@/lib/utils";

interface Props {
  stream: MediaStream;
}

const SpeakingIndicator = ({ stream }: Props) => {
  const isSpeaking = useSpeakingDetector(stream);

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

export default SpeakingIndicator;
