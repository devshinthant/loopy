import useLocalStreamStore from "@/store/local-streams";
import { motion } from "motion/react";
import DisplayBox from "./DisplayBox";
import { useParticipantsStore } from "@/store/participants";
import { memo, useEffect, useRef } from "react";
import useRemoteScreenStreamStore from "@/store/remote-screen-stream";
import { cn } from "@/lib/utils";
import ShareScreens from "./ShareScreens";
import SharingParticipantBar from "./SharingParticipantBar";
import MeView from "./MeView";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import FloatingEmojiContainer from "@/components/FloatingEmojiContainer";

gsap.registerPlugin(useGSAP);

function VideoDisplay() {
  const constraintsRef = useRef<HTMLDivElement>(null);

  const { participants } = useParticipantsStore();

  const { localScreenStream } = useLocalStreamStore();
  const { remoteScreenStream } = useRemoteScreenStreamStore();

  const isScreenSharing = localScreenStream || remoteScreenStream?.stream;

  const participantJoined = participants.length > 0;

  useEffect(() => {
    if (isScreenSharing) return;
    if (participantJoined) {
      gsap.to("#me-view", {
        width: "300px",
        height: "180px",
        bottom: "10px",
        right: "10px",
      });
    } else {
      gsap.to("#me-view", {
        width: "100%",
        height: "100%",
        bottom: "0px",
        right: "0px",
      });
    }
  }, [participantJoined, isScreenSharing]);

  return (
    <motion.div className="bg-gradient-to-br relative from-black via-gray-900 py-5 px-[5%]  to-black overflow-hidden flex-1 h-full w-full">
      <FloatingEmojiContainer />
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
            "w-[20%] flex-col": isScreenSharing,
            "w-full": !isScreenSharing,
          })}
        >
          {participants.map((stream) => {
            return <DisplayBox col={4} key={stream.id} data={stream} />;
          })}

          {isScreenSharing && (
            <div className="w-full h-full relative max-h-[20dvh]">
              <MeView
                isScreenSharing={!!isScreenSharing}
                participantJoined={participantJoined}
              />
            </div>
          )}

          {!isScreenSharing && (
            <motion.div id="me-view" className={"absolute w-full h-full"}>
              <MeView
                isScreenSharing={!!isScreenSharing}
                ref={constraintsRef}
                participantJoined={participantJoined}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default memo(VideoDisplay);
