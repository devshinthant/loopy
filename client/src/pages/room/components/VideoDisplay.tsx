import useLocalStreamStore from "@/store/local-streams";
import useRemoteStreamStore from "@/store/remote-streams";
import useUserOptionsStore from "@/store/userOptions";

import { motion } from "motion/react";

import DisplayBox from "./DisplayBox";
import { useUser } from "@clerk/clerk-react";
import VideoOff from "@/components/VideoOff";
import { MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VideoDisplay() {
  const { localVideoStream } = useLocalStreamStore();
  const { cameraOpened, micOpened } = useUserOptionsStore();

  const { user } = useUser();

  const { remoteStreams } = useRemoteStreamStore();

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden flex-1 h-full w-full">
      <div className="w-full h-full gap-5 px-[5%] py-10 flex items-center">
        {remoteStreams?.map((stream) => {
          return <DisplayBox {...stream} />;
        })}
      </div>
      <motion.div
        drag
        dragMomentum={false}
        className="absolute h-[200px] border border-gray-800 rounded-md overflow-hidden bottom-20 right-10 w-[300px]"
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
      </motion.div>
    </div>
  );
}
