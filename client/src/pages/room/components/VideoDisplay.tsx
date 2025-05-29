import useLocalStreamStore from "@/store/local-streams";
import useRemoteStreamStore from "@/store/remote-streams";

export default function VideoDisplay() {
  const { localVideoStream } = useLocalStreamStore();
  const { remoteStreams } = useRemoteStreamStore();

  return (
    <div className="flex-1">
      {remoteStreams?.map(({ stream, paused }) => (
        <div key={stream.id} style={{ position: "relative" }}>
          {!paused && (
            <video
              ref={(el) => {
                if (el) el.srcObject = stream;
              }}
              autoPlay
              playsInline
              muted={false}
              style={{
                width: "300px",
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

      <video
        ref={(el) => {
          if (el) el.srcObject = localVideoStream;
        }}
        id="localvideo"
        autoPlay
        playsInline
      />
    </div>
  );
}
