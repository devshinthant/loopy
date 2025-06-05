import useLocalStreamStore from "@/store/local-streams";
import useUserOptionsStore from "@/store/userOptions";

import { motion } from "motion/react";

import DisplayBox from "./DisplayBox";
import { useUser } from "@clerk/clerk-react";
import VideoOff from "@/components/VideoOff";
import { MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParticipantsStore } from "@/store/participants";
import { useRef } from "react";

export default function VideoDisplay() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const { localVideoStream } = useLocalStreamStore();
  const { cameraOpened, micOpened } = useUserOptionsStore();

  const { participants } = useParticipantsStore();

  const { user } = useUser();

  return (
    <motion.div
      ref={constraintsRef}
      className="bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden flex-1 h-full w-full"
    >
      <div className="w-full h-full gap-5 px-[5%] py-10 flex items-center">
        {participants.map((stream) => {
          return <DisplayBox key={stream.id} {...stream} />;
        })}
      </div>
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0.1}
        className="absolute h-[200px] cursor-grab border border-gray-800 rounded-md overflow-hidden bottom-20 right-10 w-[300px]"
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
          <VideoOff imageUrl={user?.imageUrl || ""} />
        )}

        {!micOpened && (
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              className="bg-gray-900 text-gray-300 rounded-sm size-7"
            >
              <MicOff className="size-3" />
            </Button>
          </div>
        )}
        <p className="text-xs text-white font-semibold tracking-tight absolute bottom-2 left-2">
          You
        </p>
      </motion.div>
    </motion.div>
  );
}
