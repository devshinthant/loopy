import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";
import useSelectedDevicesStore from "@/store/selectedDevices";
import getAvailableDevices from "@/lib/getAvailableDevices";
import { Mic, Play, Square } from "lucide-react";

export default function TestDevices() {
  const { selectedAudioInput, selectedAudioOutput } = useSelectedDevicesStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [devices, setDevices] = useState<{
    audioInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
  }>({ audioInputs: [], audioOutputs: [] });
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const loadDevices = async () => {
    try {
      const availableDevices = await getAvailableDevices();
      setDevices(availableDevices);
    } catch (error) {
      setError("Failed to load devices");
      console.error("Error loading devices:", error);
    }
  };

  const startRecording = async () => {
    if (!selectedAudioInput) {
      setError("Please select an audio input device first");
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: selectedAudioInput } },
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      setError(
        "Failed to start recording. Please check microphone permissions."
      );
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = async () => {
    if (!audioUrl || !selectedAudioOutput) {
      setError("Please select an audio output device and record audio first");
      return;
    }

    try {
      setError(null);

      // Create audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set audio output device if supported
      if ("setSinkId" in audio) {
        try {
          await (
            audio as HTMLAudioElement & {
              setSinkId: (deviceId: string) => Promise<void>;
            }
          ).setSinkId(selectedAudioOutput);
        } catch (error) {
          console.warn("Could not set audio output device:", error);
        }
      }

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setError("Failed to play audio");
        setIsPlaying(false);
        audioRef.current = null;
      };

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      setError("Failed to play audio");
      console.error("Error playing audio:", error);
    }
  };

  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      audioRef.current = null;
    }
  };

  const getSelectedDeviceName = (
    deviceId: string,
    deviceList: MediaDeviceInfo[]
  ) => {
    const device = deviceList.find((d) => d.deviceId === deviceId);
    return device
      ? device.label || `Device ${deviceId.slice(0, 8)}...`
      : "No device selected";
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-300">Test Devices</Label>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-2">
          {error}
        </div>
      )}

      {/* Device Info */}
      <div className="space-y-2 text-xs text-gray-400">
        <div>
          <span className="font-medium">Mic:</span>{" "}
          {getSelectedDeviceName(selectedAudioInput, devices.audioInputs)}
        </div>
        <div>
          <span className="font-medium">Speaker:</span>{" "}
          {getSelectedDeviceName(selectedAudioOutput, devices.audioOutputs)}
        </div>
      </div>

      <div className="flex w-full items-start gap-2">
        {/* Test Mic */}
        <div className="space-y-2 w-full">
          <Label className="text-xs font-medium text-gray-300">
            Test Microphone
          </Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex-1 ${
                isRecording
                  ? "bg-red-700 border-red-600 hover:bg-red-600 text-white"
                  : "bg-gray-700 border-gray-600 hover:text-gray-100 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!selectedAudioInput}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Test Mic
                </>
              )}
            </Button>
          </div>
          {isRecording && (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Recording...
            </div>
          )}
        </div>

        {/* Test Speaker */}
        <div className="space-y-2 w-full">
          <Label className="text-xs font-medium text-gray-300">
            Test Speaker
          </Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex-1 ${
                isPlaying
                  ? "bg-blue-700 border-blue-600 hover:bg-blue-600 text-white"
                  : "bg-gray-700 border-gray-600 hover:text-gray-100 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={isPlaying ? stopPlaying : playRecording}
              disabled={!audioBlob || !selectedAudioOutput}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Playing
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Test Speaker
                </>
              )}
            </Button>
          </div>
          {isPlaying && (
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              Playing...
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>1. Select your microphone and speaker devices</p>
        <p>2. Click "Test Mic" to record audio (3-5 seconds recommended)</p>
        <p>3. Click "Test Speaker" to play back the recording</p>
      </div>
    </div>
  );
}
