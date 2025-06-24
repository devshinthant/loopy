import { io } from "socket.io-client";

const server = import.meta.env.VITE_SERVER_URL;
const socketServer = server + "/mediasoup";

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === "production" ? socketServer : socketServer;
// "http://localhost:4000/mediasoup";

export const socket = io(URL, {
  autoConnect: false,
});
