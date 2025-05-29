import useRemoteAudioStreamStore from "@/store/remote-audio-streams";

export default function AudioStreams() {
  const { remoteAudioStreams } = useRemoteAudioStreamStore();
  console.log({ remoteAudioStreams });

  return (
    <>
      {remoteAudioStreams?.map(({ stream }) => (
        <audio
          key={stream.id}
          autoPlay
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
