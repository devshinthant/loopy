import { io } from "socket.io-client";

const server = import.meta.env.VITE_SERVER_URL;
const socketServer = server + "/mediasoup";

export const socket = io(socketServer, {
  autoConnect: false,
  transports: ["websocket", "polling"], // Try WebSocket first, then polling
});
