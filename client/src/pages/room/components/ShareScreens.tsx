import useLocalStreamStore from "@/store/local-streams";
import useRemoteScreenStreamStore from "@/store/remote-screen-stream";

export default function ShareScreens() {
  const { localScreenStream } = useLocalStreamStore();
  const { remoteScreenStream } = useRemoteScreenStreamStore();
  return (
    <>
      {localScreenStream && (
        <div className="h-full bg-black">
          <video
            ref={(el) => {
              if (el) el.srcObject = localScreenStream;
            }}
            className="aspect-video"
            autoPlay
            playsInline
            muted
          />
        </div>
      )}

      {remoteScreenStream && (
        <div className="bg-gray-900/100 h-full">
          <video
            ref={(el) => {
              if (el) el.srcObject = remoteScreenStream.stream;
            }}
            className="aspect-video"
            autoPlay
            playsInline
            muted
          />
        </div>
      )}
    </>
  );
}
