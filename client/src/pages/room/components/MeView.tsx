import { forwardRef, type RefObject } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MicOff } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import useLocalStreamStore from "@/store/local-streams";
import useUserOptionsStore from "@/store/userOptions";
import VideoOff from "@/components/VideoOff";

const MeView = forwardRef<HTMLDivElement>((_, ref) => {
  const { localVideoStream } = useLocalStreamStore();
  const { cameraOpened, micOpened } = useUserOptionsStore();
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
      {cameraOpened ? (
        <video
          ref={(el) => {
            if (el) el.srcObject = localVideoStream;
          }}
          id="localvideo"
          className="w-full object-cover h-full"
          autoPlay
          playsInline
        />
      ) : (
        <div className="w-full h-full">
          <VideoOff imageUrl={user?.imageUrl || ""} />
        </div>
      )}

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
    </motion.div>
  );
});

MeView.displayName = "MeView";

export default MeView;
