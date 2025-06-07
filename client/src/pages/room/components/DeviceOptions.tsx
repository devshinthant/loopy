import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import getAvailableDevices from "@/lib/getAvailableDevices";
import useSelectedDevicesStore from "@/store/selectedDevices";
import useDeviceOptionsStore from "@/store/deviceOptions";
import { useDeviceManager } from "@/hooks/useDeviceManager";

interface DeviceSettingsProps {
  roomId: string;
  type: "audio" | "video" | "audio-output";
}

export default function DeviceOptions({ roomId, type }: DeviceSettingsProps) {
  const { audioInputs, videoInputs, audioOutputs } = useDeviceOptionsStore();

  const {
    selectedAudioInput,
    selectedVideoInput,
    selectedAudioOutput,
    setSelectedAudioInput,
    setSelectedVideoInput,
    setSelectedAudioOutput,
  } = useSelectedDevicesStore();

  const { changeAudioDevice, changeVideoDevice } = useDeviceManager({ roomId });

  const handleAudioInputChange = async (deviceId: string) => {
    const success = await changeAudioDevice(deviceId);
    if (success) {
      setSelectedAudioInput(deviceId);
      toast.success("Audio input device changed successfully");
    } else {
      toast.error("Failed to change audio input device");
    }
  };

  const handleVideoInputChange = async (deviceId: string) => {
    const success = await changeVideoDevice(deviceId);
    if (success) {
      setSelectedVideoInput(deviceId);
      toast.success("Video input device changed successfully");
    } else {
      toast.error("Failed to change video input device");
    }
  };

  const handleAudioOutputChange = async (deviceId: string) => {
    try {
      // Note: Audio output device change is handled differently
      // as it doesn't involve mediasoup producers
      const audioElements = document.querySelectorAll("audio");
      audioElements.forEach(async (audio) => {
        if (audio.setSinkId) {
          await audio.setSinkId(deviceId);
        }
      });
      setSelectedAudioOutput(deviceId);
      toast.success("Audio output device changed successfully");
    } catch (error) {
      console.error("Error changing audio output:", error);
      toast.error("Failed to change audio output device");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-white font-medium">
          {type === "audio"
            ? "Audio Input"
            : type === "video"
            ? "Video Input"
            : "Audio Output"}
        </label>
        <Select
          value={
            type === "audio"
              ? selectedAudioInput
              : type === "video"
              ? selectedVideoInput
              : selectedAudioOutput
          }
          onValueChange={
            type === "audio"
              ? handleAudioInputChange
              : type === "video"
              ? handleVideoInputChange
              : handleAudioOutputChange
          }
        >
          <SelectTrigger className="bg-gray-900 border mt-1 w-full border-gray-700 text-white">
            <SelectValue placeholder="Select audio input" />
          </SelectTrigger>
          <SelectContent>
            {type === "audio" &&
              audioInputs.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                </SelectItem>
              ))}
            {type === "video" &&
              videoInputs.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                </SelectItem>
              ))}
            {type === "audio-output" &&
              audioOutputs.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Speaker ${device.deviceId.slice(0, 5)}`}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => getAvailableDevices()}
      >
        Refresh Devices
      </Button>
    </div>
  );
}
