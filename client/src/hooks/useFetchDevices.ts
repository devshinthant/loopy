import getAvailableDevices from "@/lib/getAvailableDevices";
import useDeviceOptionsStore from "@/store/deviceOptions";
import useSelectedDevicesStore from "@/store/selectedDevices";
import { useEffect } from "react";

export default function useFetchDevices() {
  const { setAudioInputs, setVideoInputs, setAudioOutputs } =
    useDeviceOptionsStore.getState();

  const {
    setSelectedAudioInput,
    setSelectedAudioOutput,
    setSelectedVideoInput,
  } = useSelectedDevicesStore.getState();

  useEffect(() => {
    const fetchDevices = async () => {
      const { audioInputs, audioOutputs, videoInputs } =
        await getAvailableDevices();

      setAudioInputs(audioInputs);
      setAudioOutputs(audioOutputs);
      setVideoInputs(videoInputs);

      setSelectedVideoInput(videoInputs[0]?.deviceId || "");
      setSelectedAudioInput(audioInputs[0]?.deviceId || "");
      setSelectedAudioOutput(audioOutputs[0]?.deviceId || "");
    };
    fetchDevices();
  }, [
    setAudioInputs,
    setAudioOutputs,
    setVideoInputs,
    setSelectedAudioInput,
    setSelectedAudioOutput,
    setSelectedVideoInput,
  ]);
}
