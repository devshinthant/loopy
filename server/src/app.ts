import { Server } from "socket.io";
import createWorker from "./worker/createWorker";
import mediaCodecs from "./config";
import server from "./server";

import mediasoup from "mediasoup";

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

let worker: mediasoup.types.Worker<mediasoup.types.AppData>;
let router: mediasoup.types.Router<mediasoup.types.AppData>;

(async () => {
  worker = await createWorker();
})();

const peers = io.of("/mediasoup");

peers.on("connetion", async (socket) => {
  console.log("New Connection", socket.id);

  const router = await worker.createRouter({
    mediaCodecs,
  });

  socket.on("getRouterRtpCapabilities", () => {});

  socket.on("createTransport", async ({ sender }, callback) => {});

  socket.on("connectProducerTransport", async ({ dtlsParameters }) => {});

  socket.on(
    "transport-produce",
    async ({ kind, rtpParameters }, callback) => {}
  );

  socket.on("connectConsumerTransport", async ({ dtlsParameters }) => {});

  socket.on("consumeMedia", async ({ rtpCapabilities }, callback) => {});

  socket.on("resumePausedConsumer", async (data) => {});
});
