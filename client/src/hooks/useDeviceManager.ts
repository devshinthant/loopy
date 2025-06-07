import { socket } from "../lib/socket";
import useLocalStreamStore from "@/store/local-streams";
import useProducersStore from "@/store/producers";
import useTransportsStore from "@/store/transports";
import useUserOptionsStore from "@/store/userOptions";

interface DeviceManagerProps {
  roomId: string;
}

export const useDeviceManager = ({ roomId }: DeviceManagerProps) => {
  const {
    localVideoStream,
    setLocalVideoStream,
    localAudioStream,
    setLocalAudioStream,
  } = useLocalStreamStore.getState();
  const { videoProducer, audioProducer } = useProducersStore.getState();
  const { produceTransport } = useTransportsStore.getState();
  const { setCameraOpened, setMicOpened } = useUserOptionsStore.getState();

  const changeVideoDevice = async (newDeviceId: string) => {
    if (!produceTransport) return;

    try {
      // Pause current video stream
      if (localVideoStream) {
        localVideoStream
          .getVideoTracks()
          .forEach((track) => (track.enabled = false));
      }

      if (!videoProducer) {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: newDeviceId } },
        });
        setLocalVideoStream(newStream);
        return true;
      }

      videoProducer.pause();
      socket.emit("producer-paused", {
        producerId: videoProducer.id,
        roomId,
        kind: "video",
      });

      // Get new video stream with selected device
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: newDeviceId } },
      });

      // Get the new video track
      const newTrack = newStream.getVideoTracks()[0];
      newTrack.enabled = true;

      // Replace the track on the existing producer
      await videoProducer.replaceTrack({ track: newTrack });

      // Resume the producer
      videoProducer.resume();
      socket.emit("producer-resumed", {
        producerId: videoProducer.id,
        roomId,
        kind: "video",
      });

      // Update local stream store
      setLocalVideoStream(newStream);
      setCameraOpened(true);

      return true;
    } catch (error) {
      console.error("Error changing video device:", error);
      return false;
    }
  };

  const changeAudioDevice = async (newDeviceId: string) => {
    if (!produceTransport) return;

    try {
      // Pause current audio stream
      if (localAudioStream) {
        localAudioStream
          .getAudioTracks()
          .forEach((track) => (track.enabled = false));
      }

      if (!audioProducer) {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: newDeviceId } },
        });
        setLocalAudioStream(newStream);
        return true;
      }

      audioProducer.pause();
      socket.emit("producer-paused", {
        producerId: audioProducer.id,
        roomId,
        kind: "audio",
      });

      // Get new audio stream with selected device
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: newDeviceId } },
      });

      // Get the new audio track
      const newTrack = newStream.getAudioTracks()[0];
      newTrack.enabled = true;

      // Replace the track on the existing producer
      await audioProducer.replaceTrack({ track: newTrack });

      // Resume the producer
      audioProducer.resume();
      socket.emit("producer-resumed", {
        producerId: audioProducer.id,
        roomId,
        kind: "audio",
      });

      // Update local stream store
      setLocalAudioStream(newStream);
      setMicOpened(true);
      return true;
    } catch (error) {
      console.error("Error changing audio device:", error);
      return false;
    }
  };

  return {
    changeVideoDevice,
    changeAudioDevice,
  };
};
