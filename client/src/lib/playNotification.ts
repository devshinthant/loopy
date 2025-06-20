export const playNotification = (type: "join" | "leave" | "error" = "join") => {
  let audio;

  if (type === "join") {
    audio = new Audio("/sounds/noti.mp3");
    audio.play().catch((err) => {
      console.warn("Auto-play blocked:", err);
    });
  } else if (type === "leave") {
    audio = new Audio("/sounds/leave.mp3");
    audio.play().catch((err) => {
      console.warn("Auto-play blocked:", err);
    });
  } else if (type === "error") {
    audio = new Audio("/sounds/error.wav");
    audio.play().catch((err) => {
      console.warn("Auto-play blocked:", err);
    });
  }
};
