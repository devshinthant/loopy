import useSelectedDevicesStore from "@/store/selectedDevices";

// Audio instance cache to prevent multiple instances
const audioInstances: Record<string, HTMLAudioElement> = {};

// Debounce timer to prevent rapid successive plays
let debounceTimer: NodeJS.Timeout | null = null;

// User preferences
let isEnabled = true;
let volume = 0.5;

export const playNotification = (
  type: "join" | "leave" | "error" | "message" = "join"
) => {
  console.log("🔊 playNotification called with type:", type);

  if (!isEnabled) {
    console.log("❌ Notifications are disabled");
    return;
  }

  // Clear any existing debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Debounce rapid successive calls
  debounceTimer = setTimeout(async () => {
    const soundMap = {
      join: "/sounds/noti.mp3",
      leave: "/sounds/leave.mp3",
      message: "/sounds/message-noti.mp3",
      error: "/sounds/error.wav",
    };

    const soundPath = soundMap[type];

    try {
      // Get the selected audio output device directly from the store
      const selectedAudioOutput =
        useSelectedDevicesStore.getState().selectedAudioOutput;

      // Stop any currently playing audio of the same type
      if (audioInstances[type]) {
        audioInstances[type].pause();
        audioInstances[type].currentTime = 0;
      }

      // Create new audio instance if it doesn't exist
      if (!audioInstances[type]) {
        audioInstances[type] = new Audio(soundPath);
        audioInstances[type].volume = volume;
        audioInstances[type].preload = "auto";
      }

      // Set the sink ID to route audio to the selected device
      if (selectedAudioOutput && "setSinkId" in audioInstances[type]) {
        try {
          await (
            audioInstances[type] as HTMLAudioElement & {
              setSinkId: (deviceId: string) => Promise<void>;
            }
          ).setSinkId(selectedAudioOutput);
          console.log(
            "Successfully routed audio to device:",
            selectedAudioOutput
          );
        } catch (err) {
          console.warn("Failed to set audio output device:", err);
        }
      } else if (selectedAudioOutput) {
        console.warn("setSinkId not supported in this browser");
      } else {
        console.log("No selected audio output device, using default");
      }

      // Play the audio
      audioInstances[type].play().catch((err) => {
        console.warn("Auto-play blocked:", err);
      });
    } catch (error) {
      console.warn("Failed to play notification:", error);
    }
  }, 100); // 100ms debounce
};

// Control functions
export const setNotificationVolume = (newVolume: number) => {
  volume = Math.max(0, Math.min(1, newVolume));
  Object.values(audioInstances).forEach((audio) => {
    audio.volume = volume;
  });
};

export const enableNotifications = () => {
  isEnabled = true;
};

export const disableNotifications = () => {
  isEnabled = false;
  // Stop all currently playing notifications
  Object.values(audioInstances).forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
};

export const stopAllNotifications = () => {
  Object.values(audioInstances).forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
};

// Cleanup function to be called when component unmounts
export const cleanupNotifications = () => {
  stopAllNotifications();
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
};
