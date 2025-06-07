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
}

export default function DeviceSettings({ roomId }: DeviceSettingsProps) {
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
      audioElements.forEach((audio) => {
        if (audio.setSinkId) {
          audio.setSinkId(deviceId);
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
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Audio Input</label>
        <Select
          value={selectedAudioInput}
          onValueChange={handleAudioInputChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select audio input" />
          </SelectTrigger>
          <SelectContent>
            {audioInputs.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Video Input</label>
        <Select
          value={selectedVideoInput}
          onValueChange={handleVideoInputChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select video input" />
          </SelectTrigger>
          <SelectContent>
            {videoInputs.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Audio Output</label>
        <Select
          value={selectedAudioOutput}
          onValueChange={handleAudioOutputChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select audio output" />
          </SelectTrigger>
          <SelectContent>
            {audioOutputs.map((device) => (
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
