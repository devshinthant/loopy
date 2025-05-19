import { Server } from "socket.io";
import mediasoup from "mediasoup";
import server from "./server";
import createWorker from "./worker/createWorker";
import mediaCodecs from "./config";
import createTransport from "./transports/createTransport";

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

let worker: mediasoup.types.Worker<mediasoup.types.AppData>;
export let router: mediasoup.types.Router<mediasoup.types.AppData>;

/* Transports */
let producerTransport: mediasoup.types.WebRtcTransport;

/* Producers */
let producer: mediasoup.types.Producer;

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
  router = await worker.createRouter({
    mediaCodecs,
  });

  socket.on("getRouterRtpCapabilities", (callback) => {
    const rtpCapabilities = router.rtpCapabilities;
    callback({ rtpCapabilities });
  });

  socket.on("createTransport", async ({ sender }, callback) => {
    if (sender) {
      const transport = await createTransport(callback);
      if (transport) {
        producerTransport = transport;
      }
    }
  });

  socket.on("connectProducerTransport", async ({ dtlsParameters }) => {
    if (!producerTransport) {
      return console.log("No producer transport");
    }
    await producerTransport.connect({ dtlsParameters });
  });

  socket.on("transport-produce", async ({ kind, rtpParameters }, callback) => {
    producer = await producerTransport.produce({
      kind,
      rtpParameters,
    });

    producer.on("transportclose", () => {
      console.log("Producer transport closed");
      producer.close();
    });

    callback({ id: producer.id });
  });

  //   socket.on("connectConsumerTransport", async ({ dtlsParameters }) => {});

  //   socket.on("consumeMedia", async ({ rtpCapabilities }, callback) => {});

  //   socket.on("resumePausedConsumer", async (data) => {});
});
