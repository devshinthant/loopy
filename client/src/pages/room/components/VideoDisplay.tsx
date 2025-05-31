import useLocalStreamStore from "@/store/local-streams";
import useRemoteStreamStore from "@/store/remote-streams";

export default function VideoDisplay() {
  const { localVideoStream } = useLocalStreamStore();
  const { remoteStreams } = useRemoteStreamStore();

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden flex-1 h-full w-full">
      <div className="w-full h-full flex items-center">
        {remoteStreams?.map(({ stream, paused }) => (
          <div key={stream.id} className="w-full h-full">
            {!paused && (
              <video
                ref={(el) => {
                  if (el) el.srcObject = stream;
                }}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
                muted={false}
                style={{
                  filter: paused ? "grayscale(100%) brightness(0.5)" : "none",
                }}
              />
            )}

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
                  color: "white",
                  fontSize: "1.2rem",
                }}
              >
                Camera Off
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="absolute border-[2px] border-foreground rounded-md overflow-hidden bottom-20 right-10 w-[300px]">
        <video
          ref={(el) => {
            if (el) el.srcObject = localVideoStream;
          }}
          id="localvideo"
          className="w-full object-cover h-[200px]"
          autoPlay
          playsInline
        />
      </div>
    </div>
  );
}
