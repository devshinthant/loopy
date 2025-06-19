import useLocalStreamStore from "@/store/local-streams";
import { motion } from "motion/react";
import DisplayBox from "./DisplayBox";
import { useParticipantsStore } from "@/store/participants";
import { memo, useRef } from "react";
import useRemoteScreenStreamStore from "@/store/remote-screen-stream";
import { cn } from "@/lib/utils";
import ShareScreens from "./ShareScreens";
import SharingParticipantBar from "./SharingParticipantBar";
import MeView from "./MeView";

function VideoDisplay() {
  const constraintsRef = useRef<HTMLDivElement>(null);

  const { participants } = useParticipantsStore();

  const { localScreenStream } = useLocalStreamStore();
  const { remoteScreenStream } = useRemoteScreenStreamStore();

  const isScreenSharing = localScreenStream || remoteScreenStream?.stream;

  const participantJoined = participants.length > 0;

  return (
    <motion.div className="bg-gradient-to-br relative from-black via-gray-900 py-5 px-[5%]  to-black overflow-hidden flex-1 h-full w-full">
      <SharingParticipantBar />
      <div className="w-full flex-1 h-full gap-5 flex items-start">
        {isScreenSharing && (
          <div className="w-[80%] h-full">
            <ShareScreens />
          </div>
        )}

        <motion.div
          ref={constraintsRef}
          className={cn("h-full flex relative gap-5 flex-row", {
            "w-[20%]": isScreenSharing,
            "w-full": !isScreenSharing,
          })}
        >
          {participants.map((stream) => {
            return <DisplayBox col={4} key={stream.id} data={stream} />;
          })}

          <motion.div
            animate={{
              width: participantJoined ? "300px" : "100%",
              height: participantJoined ? "180px" : "100%",
              bottom: participantJoined ? "10px" : "0px",
              right: participantJoined ? "10px" : "0px",
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
            }}
            className={cn("w-full absolute h-full")}
          >
            <MeView
              ref={constraintsRef}
              participantJoined={participantJoined}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default memo(VideoDisplay);
