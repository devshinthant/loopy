import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import useFetchDevices from "@/hooks/useFetchDevices";
import useDeviceOptionsStore from "@/store/deviceOptions";
import useLocalStreamStore from "@/store/local-streams";
import useSelectedDevicesStore from "@/store/selectedDevices";
import { Camera, Mic, Settings, Volume2 } from "lucide-react";

export default function DeviceSettingPanel() {
  const {
    selectedVideoInput,
    setSelectedVideoInput,
    selectedAudioInput,
    setSelectedAudioInput,
    selectedAudioOutput,
    setSelectedAudioOutput,
  } = useSelectedDevicesStore();

  const { videoInputs, audioInputs, audioOutputs } = useDeviceOptionsStore();

  const getCurrentDevice = (devices: MediaDeviceInfo[], selectedId: string) => {
    return devices.find((device) => device.deviceId === selectedId);
  };

  useFetchDevices();

  const {
    localAudioStream,
    setLocalAudioStream,
    localVideoStream,
    setLocalVideoStream,
  } = useLocalStreamStore.getState();

  const onAudioInputChange = async (value: string) => {
    setSelectedAudioInput(value);

    if (!localAudioStream) return;
    localAudioStream
      .getAudioTracks()
      .forEach((track) => (track.enabled = false));

    const newStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: value } },
    });

    const newTrack = newStream.getAudioTracks()[0];
    newTrack.enabled = true;

    setLocalAudioStream(newStream);
  };

  const onVideoInputChange = async (value: string) => {
    setSelectedVideoInput(value);

    if (!localVideoStream) return;
    localVideoStream
      .getVideoTracks()
      .forEach((track) => (track.enabled = false));

    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: value } },
    });

    const newTrack = newStream.getVideoTracks()[0];
    newTrack.enabled = true;

    setLocalVideoStream(newStream);
  };

  return (
    <div className="lg:col-span-1">
      <Card className="bg-black/40 backdrop-blur-sm border-gray-800/50 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-5 h-5 text-gray-400" />
            <h3 className="text-xl font-semibold text-white">
              Device Settings
            </h3>
          </div>

          <div className="space-y-8">
            {/* Camera Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Camera
              </Label>
              <Select
                value={selectedVideoInput || ""}
                onValueChange={(value) => onVideoInputChange(value)}
              >
                <SelectTrigger className="bg-black/50 w-full border-gray-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-gray-800">
                  {videoInputs.map((camera) => (
                    <SelectItem
                      key={camera.deviceId}
                      value={camera.deviceId}
                      className="text-white focus:bg-gray-800 focus:text-white"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{camera.label}</span>
                        {camera.deviceId === selectedVideoInput && (
                          <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Current:{" "}
                {getCurrentDevice(videoInputs, selectedVideoInput)?.label}
              </p>
            </div>

            <Separator className="bg-gray-600" />

            {/* Microphone Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Microphone
              </Label>
              <Select
                value={selectedAudioInput || ""}
                onValueChange={(value) => onAudioInputChange(value)}
              >
                <SelectTrigger className="bg-black/50 w-full border-gray-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {audioInputs.map((mic) => (
                    <SelectItem
                      key={mic.deviceId}
                      value={mic.deviceId}
                      className="text-white focus:bg-gray-600 focus:text-white"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{mic.label}</span>
                        {mic.deviceId === selectedAudioInput && (
                          <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Current:{" "}
                {getCurrentDevice(audioInputs, selectedAudioInput)?.label}
              </p>
            </div>

            <Separator className="bg-gray-600" />

            {/* Speaker Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Speaker
              </Label>
              <Select
                value={selectedAudioOutput}
                onValueChange={setSelectedAudioOutput}
              >
                <SelectTrigger className="bg-black/50 w-full border-gray-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {audioOutputs.map((speaker) => (
                    <SelectItem
                      key={speaker.deviceId}
                      value={speaker.deviceId}
                      className="text-white focus:bg-gray-600 focus:text-white"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{speaker.label}</span>
                        {speaker.deviceId === selectedAudioOutput && (
                          <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Current:{" "}
                {getCurrentDevice(audioOutputs, selectedAudioOutput)?.label}
              </p>
            </div>

            <Separator className="bg-gray-600" />

            {/* Test Buttons */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">
                Test Devices
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-gray-700 border-gray-600 hover:text-gray-100 text-gray-300 hover:bg-gray-600"
                >
                  Test Mic
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-gray-700 border-gray-600 hover:text-gray-100 text-gray-300 hover:bg-gray-600"
                >
                  Test Speaker
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
