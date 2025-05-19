import { Server } from "socket.io";
import mediasoup from "mediasoup";
import server from "./server";
import createWorker from "./worker/createWorker";
import mediaCodecs from "./config";

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

let worker: mediasoup.types.Worker<mediasoup.types.AppData>;
let router: mediasoup.types.Router<mediasoup.types.AppData>;

const peers = io.of("/mediasoup");

peers.on("connection", async (socket) => {
  console.log("New Connection", socket.id);

  socket.emit("connection-success", {
    socketId: socket.id,
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });

  worker = await createWorker();
  const router = await worker.createRouter({
    mediaCodecs,
  });

  socket.on("getRouterRtpCapabilities", (callback) => {
    const rtpCapabilities = router.rtpCapabilities;
    callback({ rtpCapabilities });
  });

  //   socket.on("createTransport", async ({ sender }, callback) => {});

  //   socket.on("connectProducerTransport", async ({ dtlsParameters }) => {});

  //   socket.on(
  //     "transport-produce",
  //     async ({ kind, rtpParameters }, callback) => {}
  //   );

  //   socket.on("connectConsumerTransport", async ({ dtlsParameters }) => {});

  //   socket.on("consumeMedia", async ({ rtpCapabilities }, callback) => {});

  //   socket.on("resumePausedConsumer", async (data) => {});
});
