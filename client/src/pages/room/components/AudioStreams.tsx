import useRemoteAudioStreamStore from "@/store/remote-audio-streams";
import { memo } from "react";

function AudioStreams() {
  const { remoteAudioStreams } = useRemoteAudioStreamStore();
  console.log({ remoteAudioStreams });

  return (
    <>
      {remoteAudioStreams?.map(({ stream }) => (
        <audio
          key={stream.id}
          autoPlay
          hidden
          controls
          ref={(el) => {
            if (el) {
              el.srcObject = stream;
            }
          }}
        />
      ))}
    </>
  );
}

export default memo(AudioStreams);
