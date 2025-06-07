import getAvailableDevices from "@/lib/getAvailableDevices";
import useDeviceOptionsStore from "@/store/deviceOptions";
import useSelectedDevicesStore from "@/store/selectedDevices";
import { useEffect } from "react";

export default function useListenDeviceChange() {
  const {
    setSelectedAudioInput,
    setSelectedVideoInput,
    setSelectedAudioOutput,
  } = useSelectedDevicesStore.getState();

  const { setAudioInputs, setVideoInputs, setAudioOutputs } =
    useDeviceOptionsStore.getState();

  useEffect(() => {
    const loadDevices = async () => {
      const availableDevices = await getAvailableDevices();
      setAudioInputs(availableDevices.audioInputs);
      setVideoInputs(availableDevices.videoInputs);
      setAudioOutputs(availableDevices.audioOutputs);

      // Set initial selected devices
      if (availableDevices.audioInputs.length > 0) {
        setSelectedAudioInput(availableDevices.audioInputs[0].deviceId);
      }
      if (availableDevices.videoInputs.length > 0) {
        setSelectedVideoInput(availableDevices.videoInputs[0].deviceId);
      }
      if (availableDevices.audioOutputs.length > 0) {
        setSelectedAudioOutput(availableDevices.audioOutputs[0].deviceId);
      }
    };

    loadDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener("devicechange", loadDevices);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", loadDevices);
    };
  }, [
    setSelectedAudioInput,
    setSelectedVideoInput,
    setSelectedAudioOutput,
    setAudioInputs,
    setVideoInputs,
    setAudioOutputs,
  ]);
}
