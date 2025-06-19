import { forwardRef, useEffect, useRef, type RefObject } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MicOff } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import useLocalStreamStore from "@/store/local-streams";
import useUserOptionsStore from "@/store/userOptions";
import VideoOff from "@/components/VideoOff";
import SpeakingIndicator from "./SpeakingIndicator";

const MeView = forwardRef<HTMLDivElement>((_, ref) => {
  const { user } = useUser();

  return (
    <motion.div
      ref={ref}
      drag
      dragConstraints={ref as RefObject<Element | null>}
      dragMomentum={false}
      dragElastic={0.1}
      className="absolute cursor-grab border border-gray-800 rounded-md overflow-hidden bottom-20 right-10 w-[300px] h-[180px]"
    >
      <VideoWrapper imageUrl={user?.imageUrl || ""}>
        <Me />
      </VideoWrapper>
      <MicIndicator />
    </motion.div>
  );
});

MeView.displayName = "MeView";

export default MeView;

const VideoWrapper = ({
  children,
  imageUrl,
}: {
  children: React.ReactNode;
  imageUrl: string;
}) => {
  const { cameraOpened } = useUserOptionsStore();
  return (
    <>{cameraOpened ? children : <VideoOff imageUrl={imageUrl || ""} />}</>
  );
};

const Me = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { localVideoStream } = useLocalStreamStore();

  const openWindow = async () => {
    try {
      if (!videoRef.current) return;

      await videoRef.current.requestPictureInPicture();
    } catch (error) {
      if (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        openWindow();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = localVideoStream;
    }
  }, [localVideoStream]);

  return (
    <video
      ref={videoRef}
      id="localvideo"
      className="w-full object-cover h-full"
      autoPlay
      playsInline
    />
  );
};

const MicIndicator = () => {
  const { micOpened } = useUserOptionsStore();
  const { localAudioStream } = useLocalStreamStore();

  return (
    <>
      {!micOpened && (
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            className="bg-gray-900 text-gray-300 px-2 py-1 rounded-md"
          >
            <MicOff className="w-4 h-4" />
          </Button>
        </div>
      )}

      {localAudioStream && micOpened && (
        <SpeakingIndicator stream={localAudioStream} />
      )}
    </>
  );
};
