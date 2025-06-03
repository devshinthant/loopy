import { getProducerInfo } from "@/lib/getProducerInfo";
import useConsumersStore from "@/store/consumers";
import useLocalStreamStore from "@/store/local-streams";
import useRemoteStreamStore from "@/store/remote-streams";
import useUserOptionsStore from "@/store/userOptions";
import { VideoOff } from "lucide-react";
import { motion } from "motion/react";

export default function VideoDisplay() {
  const { localVideoStream } = useLocalStreamStore();
  const { cameraOpened } = useUserOptionsStore();

  const { remoteStreams } = useRemoteStreamStore();

  const { consumers } = useConsumersStore();

  console.log({ consumers });

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden flex-1 h-full w-full">
      <div className="w-full h-full gap-5 px-[5%] py-10 flex items-center">
        {remoteStreams?.map(({ stream, paused, producerId }) => {
          console.log(getProducerInfo({ producerId }), "PRODUCER INFO");

          return (
            <div
              key={stream.id}
              className="w-full rounded-md overflow-hidden relative h-full"
            >
              {!paused && (
                <video
                  ref={(el) => {
                    if (el) el.srcObject = stream;
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  muted={false}
                  style={{
                    filter: paused
                      ? "grayscale(100%) brightness( 0.5)"
                      : "none",
                  }}
                />
              )}
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <p className="text-white">
                  {getProducerInfo({ producerId })?.name || "Unknown"}
                  {getProducerInfo({ producerId })?.imageUrl && (
                    <img
                      src={getProducerInfo({ producerId })?.imageUrl}
                      alt="Producer"
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                </p>
              </div>
              {paused && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    fontSize: "1.2rem",
                  }}
                >
                  <VideoOff className="text-gray-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <motion.div
        drag
        dragMomentum={false}
        className="absolute border-[2px] border-gray-800/40 rounded-md overflow-hidden bottom-20 right-10 w-[300px]"
      >
        {cameraOpened ? (
          <video
            ref={(el) => {
              if (el) el.srcObject = localVideoStream;
            }}
            id="localvideo"
            className="w-full object-cover h-[200px]"
            autoPlay
            playsInline
          />
        ) : (
          <div className="w-full h-[200px] bg-black text-white flex items-center justify-center">
            <VideoOff className="text-gray-400" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
