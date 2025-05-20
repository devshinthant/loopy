import { Server } from "socket.io";
import mediasoup from "mediasoup";
import server from "./server";
import createWorker from "./worker/createWorker";
import mediaCodecs from "./config";
import createTransport from "./transports/createTransport";
import Room from "./room/room";

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

let worker: mediasoup.types.Worker<mediasoup.types.AppData>;

const peers = io.of("/mediasoup");

export const rooms = new Map<string, Room>();

peers.on("connection", async (socket) => {
  console.log("New Connection", socket.id);

  socket.emit("connection-success", {
    socketId: socket.id,
  });

  socket.emit("WTF", ["HEHE"]);

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });

  socket.on(
    "createRoom",
    async (
      { roomId, password },
      callback: ({ message }: { message: string }) => void
    ) => {
      const room = rooms.get(roomId);
      if (room) {
        return callback({
          message: "Room already existed",
        });
      }

      if (!worker) {
        worker = await createWorker();
      }
      const router = await worker.createRouter({
        mediaCodecs,
      });

      const newRoom = new Room(roomId, password, router);
      rooms.set(roomId, newRoom);

      newRoom.addPeer(socket);

      callback({
        message: "Room created",
      });

      socket.emit("WTF", ["HEHE"]);
    }
  );

  socket.on("joinRoom", ({ roomId, password }, callback) => {
    const room = rooms.get(roomId);

    console.log("INTO");

    if (!room) {
      return callback({
        error: "Room not found",
      });
    }

    console.log("STEP 1");

    if (room.password !== password) {
      return callback({ error: "Invalid password" });
    }

    console.log("STEP 2");

    room.addPeer(socket);

    console.log("STEP 3");

    /* Get Existing Producers */
    const peers = room.getPeers();
    console.log({ peers });

    console.log("STEP 4");

    if (!peers) return;
    const producers = Array.from(peers)
      .filter(([peerId, peer]) => {
        return peerId !== socket.id;
      })
      .map(([peerId]) => peerId);

    console.log({ producers }, "PRODUCERS FROM SERVER");

    // Emit to all clients in the room, including the new joiner
    socket.emit("lee", { producers });

    callback({
      message: "Joined room",
    });
  });

  socket.on("getRouterRtpCapabilities", ({ roomId }, callback) => {
    try {
      if (!roomId) {
        return callback({
          params: {
            error: "Room ID is required",
          },
        });
      }

      const room = rooms.get(roomId);

      if (!room) {
        return callback({
          error: "Room not found",
        });
      }
      const rtpCapabilities = room.router?.rtpCapabilities;
      callback({ rtpCapabilities });
    } catch (error) {
      callback({
        error,
      });
    }
  });

  socket.on("createTransport", async ({ sender, roomId }, callback) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const peer = room.getPeer(socket);
    if (!peer) return;
    const transport = await createTransport(roomId, callback);

    if (!transport) {
      return callback({
        error: "Failed to create transport",
      });
    }

    if (sender) {
      peer.addProducerTransport(transport);
    } else {
      peer.addConsumerTransport(transport);
    }
  });

  socket.on("connectProducerTransport", async ({ dtlsParameters, roomId }) => {
    try {
      const room = rooms.get(roomId);
      if (!room) return;

      const peer = room.getPeer(socket);
      if (!peer) return;

      await peer.producerTransport?.connect({ dtlsParameters });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(
    "transport-produce",
    async ({ kind, rtpParameters, roomId }, callback) => {
      try {
        const room = rooms.get(roomId);
        if (!room) return;

        const peer = room.getPeer(socket);
        if (!peer) return;

        const producer = await peer.producerTransport?.produce({
          kind,
          rtpParameters,
        });

        if (!producer) {
          return callback({
            params: {
              error: "Failed to create producer",
            },
          });
        }

        peer.addVideoProducer(producer);

        producer.on("transportclose", () => {
          console.log("Producer transport closed");
          producer.close();
        });

        callback({ id: producer.id });
      } catch (error) {
        callback({
          params: {
            error,
          },
        });
      }
    }
  );

  socket.on(
    "connectConsumerTransport",
    async ({ dtlsParameters, roomId }, callback) => {
      try {
        const room = rooms.get(roomId);
        if (!room) {
          return callback({
            error: "Room not found",
          });
        }

        const peer = room.getPeer(socket);
        if (!peer) {
          return callback({
            error: "Peer not found",
          });
        }

        await peer.consumerTransport?.connect({ dtlsParameters });

        callback({
          message: "Consumer transport connected",
        });
      } catch (error) {
        callback({
          message: "Consumer transport connected",
        });
      }
    }
  );

  socket.on(
    "consumeMedia",
    async ({ rtpCapabilities, roomId, producerId, kind }, callback) => {
      try {
        if (!producerId) {
          return callback({
            error: "Producer Id Not Found",
          });
        }

        const room = rooms.get(roomId);
        if (!room) {
          return callback({
            error: "Room not found",
          });
        }

        const router = room.router;
        if (!router) {
          return callback({
            error: "Router not found",
          });
        }

        if (!router.canConsume({ producerId, rtpCapabilities })) {
          return callback({
            error: "Cannot consume media",
          });
        }

        const peer = room.getPeer(socket);
        if (!peer) {
          return callback({
            error: "Peer not found",
          });
        }

        const transport = peer.consumerTransport;
        if (!transport) {
          return callback({
            error: "ConsumerTransport not found",
          });
        }

        const consumer = await transport.consume({
          producerId,
          rtpCapabilities,
          paused: kind === "video",
        });

        peer.addConsumer(producerId, consumer);

        consumer.on("transportclose", () => {
          console.log("Consumer transport closed");
          consumer.close();
        });

        consumer.on("producerclose", () => {
          console.log("Producer closed");
          consumer.close();
        });

        callback({
          producerId,
          id: consumer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        });
      } catch (error) {
        callback({
          params: {
            error,
          },
        });
      }
    }
  );

  socket.on("resumePausedConsumer", async ({ consumerId, roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const peer = room.getPeer(socket);
    if (!peer) return;

    await peer.consumers?.get(consumerId)?.resume();
    console.log("Consumer resumed");
  });
});
