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
  if (!isEnabled) return;

  // Clear any existing debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Debounce rapid successive calls
  debounceTimer = setTimeout(() => {
    const soundMap = {
      join: "/sounds/noti.mp3",
      leave: "/sounds/leave.mp3",
      message: "/sounds/message-noti.mp3",
      error: "/sounds/error.wav",
    };

    const soundPath = soundMap[type];

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

    // Play the audio
    audioInstances[type].play().catch((err) => {
      console.warn("Auto-play blocked:", err);
    });
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
