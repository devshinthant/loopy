import useConsumersStore from "@/store/consumers";
import useDeviceOptionsStore from "@/store/deviceOptions";
import useLocalStreamStore from "@/store/local-streams";
import { useParticipantsStore } from "@/store/participants";
import useProducersStore from "@/store/producers";
import useRaiseHandStore from "@/store/raiseHand";
import useRemoteAudioStreamStore from "@/store/remote-audio-streams";
import useRemoteScreenStreamStore from "@/store/remote-screen-stream";
import useRemoteStreamStore from "@/store/remote-streams";
import useSelectedDevicesStore from "@/store/selectedDevices";
import useTransportsStore from "@/store/transports";
import useUserOptionsStore from "@/store/userOptions";

const cleanUp = () => {
  console.log("Cleaning Up...");

  /* Clear Selected Devices */
  const {
    resetSelectedAudioInput,
    resetSelectedAudioOutput,
    resetSelectedVideoInput,
  } = useSelectedDevicesStore.getState();
  resetSelectedAudioInput();
  resetSelectedAudioOutput();
  resetSelectedVideoInput();

  /* Clear Raised Hands */
  const { clearRaisedHands } = useRaiseHandStore.getState();
  clearRaisedHands();
  console.log("Raised Hands Cleared");

  /* Clear User Options */
  const { resetMicOpened, resetCameraOpened } = useUserOptionsStore.getState();
  resetMicOpened();
  resetCameraOpened();
  console.log("User Options Cleared");

  /* Clear deviceOptions */
  const { resetAudioInputs, resetAudioOutputs, resetVideoInputs } =
    useDeviceOptionsStore.getState();
  resetAudioInputs();
  resetAudioOutputs();
  resetVideoInputs();
  console.log("Device Options Cleared");

  /* Close Transports */
  const {
    resetProduceTransport,
    resetReceiveTransport,
    produceTransport,
    receiveTransport,
  } = useTransportsStore.getState();
  produceTransport?.close();
  resetProduceTransport();
  receiveTransport?.close();
  resetReceiveTransport();
  console.log("Transports closed");

  /* Close Local Stream */
  const {
    localAudioStream,
    localVideoStream,
    resetLocalAudioStream,
    resetLocalVideoStream,
    localScreenStream,
    resetLocalScreenStream,
  } = useLocalStreamStore.getState();
  localVideoStream?.getTracks().forEach((track) => track.stop());
  resetLocalVideoStream();

  localScreenStream?.getTracks().forEach((track) => track.stop());
  resetLocalScreenStream();

  localAudioStream?.getTracks().forEach((track) => track.stop());
  resetLocalAudioStream();
  console.log("Local Stream Reset");

  /* Close Remote Video Streams */
  const { remoteStreams, resetRemoteStreams } = useRemoteStreamStore.getState();
  remoteStreams?.forEach(({ stream }) =>
    stream.getTracks().forEach((track) => track.stop())
  );
  resetRemoteStreams();

  /* Close Remote Audio Streams */
  const { remoteAudioStreams, resetRemoteAudioStreams } =
    useRemoteAudioStreamStore.getState();
  remoteAudioStreams?.forEach(({ stream }) =>
    stream.getTracks().forEach((track) => track.stop())
  );
  resetRemoteAudioStreams();
  console.log("Remote Streams Reset");

  /* Close Remote Screen Stream */
  const { remoteScreenStream, resetRemoteScreenStream } =
    useRemoteScreenStreamStore.getState();
  remoteScreenStream?.stream?.getTracks().forEach((track) => track.stop());
  resetRemoteScreenStream();
  console.log("Remote Screen Stream Reset");

  /* Close Video Producer */
  const { videoProducer, resetVideoProducer } = useProducersStore.getState();
  videoProducer?.close();
  resetVideoProducer();
  console.log("Producer Closed");

  /* Close Audio Producer */
  const { audioProducer, resetAudioProducer } = useProducersStore.getState();
  audioProducer?.close();
  resetAudioProducer();
  console.log("Audio Producer Closed");

  /* Close Consumers */
  const { consumers, resetConsumers } = useConsumersStore.getState();
  console.log({ consumers });
  consumers?.forEach((consumer) => consumer.close());
  resetConsumers();
  console.log("Consumers Closed");

  /* Reset Participants */
  const { resetParticipants } = useParticipantsStore.getState();
  resetParticipants();
  console.log("Participants Reset");
};

export default cleanUp;
