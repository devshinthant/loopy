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
import useRemoteScreenStreamStore from "@/store/remote-screen-stream";
import { cn } from "@/lib/utils";
import ShareScreens from "./ShareScreens";
import SharingParticipantBar from "./SharingParticipantBar";

export default function VideoDisplay() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const { localVideoStream } = useLocalStreamStore();
  const { cameraOpened, micOpened } = useUserOptionsStore();

  const { participants } = useParticipantsStore();

  const { user } = useUser();

  const { localScreenStream } = useLocalStreamStore();
  const { remoteScreenStream } = useRemoteScreenStreamStore();

  const isScreenSharing = localScreenStream || remoteScreenStream?.stream;

  return (
    <motion.div
      ref={constraintsRef}
      className="bg-gradient-to-br from-black via-gray-900 py-5 px-[5%] to-black overflow-hidden flex-1 h-full w-full"
    >
      <SharingParticipantBar />
      <div className="w-full flex-1 h-full gap-5 flex items-start">
        {isScreenSharing && (
          <div className="w-[80%] h-full">
            <ShareScreens />
          </div>
        )}
        <div
          className={cn("h-full flex gap-5 flex-row", {
            "w-[20%]": isScreenSharing,
            "w-full": !isScreenSharing,
          })}
        >
          {participants.map((stream) => {
            return <DisplayBox col={4} key={stream.id} data={stream} />;
          })}
        </div>
      </div>

      <motion.div
        drag
        dragConstraints={constraintsRef}
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
    </motion.div>
  );
}
