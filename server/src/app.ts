import { Server } from "socket.io";
import mediasoup from "mediasoup";
import server from "./server";
import createWorker from "./worker/createWorker";
import mediaCodecs from "./config";
import createTransport from "./transports/createTransport";
import Room from "./room/room";
import cleanUp from "./cleanUp";
import { uuid } from "uuidv4";

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

  try {
    socket.emit("connection-success", {
      socketId: socket.id,
    });
    console.log("EMITTED connection-success to", socket.id);
  } catch (error) {
    console.error("Error emitting connection-success:", error);
  }

  socket.on("leave-room", ({ roomId, userId }) => {
    socket.to(roomId).emit("participant-update", {
      participant: {
        id: userId,
      },
      type: "remove",
    });
    cleanUp({ socket, roomId });
  });

  socket.on("disconnect", () => {
    rooms.forEach((room) => {
      const peer = room.getPeer(socket);
      if (!peer) return;
      socket.to(room.id).emit("participant-update", {
        participant: {
          id: peer.data.id,
        },
        type: "remove",
      });
    });

    cleanUp({ socket });

    console.log("Client disconnected", socket.id);
  });

  socket.on("end-room", ({ roomId }) => {
    cleanUp({ socket, roomId, endRoom: true });
  });

  socket.on(
    "createRoom",
    async (
      { roomId, password, userData },
      callback: ({
        message,
        error,
      }: {
        message?: string;
        error?: string;
        roomCreatedAt?: number;
      }) => void
    ) => {
      console.log({ userData }, "FROM SERVER");

      const room = rooms.get(roomId);
      if (room) {
        return callback({
          error: "Room already existed",
        });
      }

      if (!worker) {
        worker = await createWorker();
      }

      socket.join(roomId);

      const router = await worker.createRouter({
        mediaCodecs,
      });

      const newRoom = new Room(roomId, password, router);
      rooms.set(roomId, newRoom);

      newRoom.addPeer(socket, userData);

      callback({
        message: "Room created",
        roomCreatedAt: newRoom.createdAt,
      });
    }
  );

  socket.on("joinRoom", ({ roomId, password, userData }, callback) => {
    const room = rooms.get(roomId);

    console.log({ userData }, "FROM SERVER");

    if (!room) {
      return callback({
        error: "Room not found",
      });
    }

    if (room.password !== password) {
      return callback({ error: "Invalid password" });
    }
    room.addPeer(socket, userData);
    callback({
      message: "Joined room",
      participantCount: (room.getPeers()?.size || 0) - 1,
      roomCreatedAt: room.createdAt,
    });
  });

  socket.on("enter-room", ({ roomId, userData }, callback) => {
    const room = rooms.get(roomId);
    if (!room) return;
    socket.join(roomId);

    socket.to(roomId).emit("participant-update", {
      participant: userData,
      type: "add",
    });

    const peers = room.getPeers();

    if (!peers) {
      return callback({
        message: "No peers found",
        hostName: undefined,
      });
    }

    const host = Array.from(peers).find(([peerId, peer]) => {
      return peer.data.isHost;
    })?.[1];

    callback({
      message: "Entered room",
      hostName: host?.data.name,
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
    async ({ kind, rtpParameters, roomId, appData }, callback) => {
      console.log({ kind }, "SERVER KIND");

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

        if (kind === "video" && appData.screenShare) {
          peer.addScreenShareProducer(producer);
        } else {
          if (kind === "video") {
            peer.addVideoProducer(producer);
          } else {
            peer.addAudioProducer(producer);
          }
        }

        producer.on("transportclose", () => {
          console.log("Producer transport closed");
          producer.close();
        });

        callback({ id: producer.id });

        socket.to(roomId).emit("producer-update", {
          producerId: producer.id,
          kind: producer.kind,
          screenShare: appData.screenShare,
          type: "add",
          producerData: peer.data,
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
    "consumeProducer",
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

        if (
          !router.canConsume({
            producerId,
            rtpCapabilities,
          })
        ) {
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

  socket.on("resumePausedConsumer", async ({ producerId, roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const peer = room.getPeer(socket);
    if (!peer) return;

    await peer.consumers?.get(producerId)?.resume();
    console.log("Consumer resumed");
  });

  socket.on("giveMeOthers", ({ roomId }, callback) => {
    const room = rooms.get(roomId);
    if (!room) return callback({ message: "Room not found" });

    /* Get Existing Producers */
    const peers = room.getPeers();
    if (!peers) return callback({ message: "No peers found" });

    const producers = Array.from(peers)
      .filter(([peerId, peer]) => {
        console.log({ peer });

        return peerId !== socket.id;
      })
      .map(([, peer]) => [
        ...(peer.audioProducer
          ? [
              {
                kind: "audio",
                userData: peer.data,
                screenShare: false,
                paused: peer.audioProducer?.paused,
                producerId: peer.audioProducer?.id,
              },
            ]
          : []),
        ...(peer.videoProducer
          ? [
              {
                kind: "video",
                userData: peer.data,
                screenShare: false,
                paused: peer.videoProducer?.paused,
                producerId: peer.videoProducer?.id,
              },
            ]
          : []),
        ...(peer.screenShareProducer
          ? [
              {
                kind: "video",
                screenShare: true,
                userData: peer.data,
                paused: false,
                producerId: peer.screenShareProducer?.id,
              },
            ]
          : []),
      ])
      .flat();

    socket.emit("getOtherProducers", {
      producers,
    });
  });

  socket.on("get-initial-participants", ({ roomId }, callback) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const peers = room.getPeers();
    if (!peers) return;

    const participants = Array.from(peers)
      .filter(([peerId, peer]) => {
        console.log({ peer });

        return peerId !== socket.id;
      })
      .map(([, peer]) => peer.data);

    callback({
      participants,
    });
  });

  socket.on("producer-paused", async ({ producerId, roomId, kind }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const peer = room.getPeer(socket);
    if (!peer) return;

    if (kind === "audio") {
      await peer.audioProducer?.pause();
    } else {
      await peer.videoProducer?.pause();
    }

    console.log("server producer-paused", { producerId, roomId, kind });

    socket.to(roomId).emit("peer-producer-paused", {
      producerId,
      peerId: socket.id,
      kind,
    });
  });

  socket.on("producer-resumed", async ({ producerId, roomId, kind }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const peer = room.getPeer(socket);
    if (!peer) return;

    if (kind === "audio") {
      await peer.audioProducer?.resume();
    } else {
      await peer.videoProducer?.resume();
    }
    console.log("server producer-resumed", { producerId, roomId, kind });
    socket.to(roomId).emit("peer-producer-resumed", {
      producerId,
      peerId: socket.id,
      kind,
    });
  });

  socket.on("end-screen-share", ({ roomId }, callback) => {
    console.log("END SCREEN SHARE");

    const room = rooms.get(roomId);
    if (!room) return;

    const peer = room.getPeer(socket);
    if (!peer) return;

    peer.screenShareProducer?.close();
    peer.screenShareProducer = undefined;

    socket.to(roomId).emit("producer-update", {
      peerId: socket.id,
      producerId: "",
      kind: "video",
      type: "remove",
      producerData: {},
      screenShare: true,
    });

    callback({
      message: "Screen share ended",
    });
  });

  /* Chat Events */
  socket.on("send-message", ({ roomId, message }, callback) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const peer = room.getPeer(socket);
    if (!peer) return;

    const messageId = uuid();
    const messageData = {
      id: messageId,
      userData: peer.data,
      message,
      createdAt: Date.now(),
      type: "text",
      isOwn: false,
    };
    callback(messageData);
    socket.to(roomId).emit("user-typing", {
      from: peer.data,
      typing: false,
    });
    socket.to(roomId).emit("receive-message", messageData);
  });

  socket.on("typing", ({ roomId }: { roomId: string }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const peer = room.getPeer(socket);
    if (!peer) return;

    const userData = peer.data;

    socket.to(roomId).emit("user-typing", {
      from: userData,
      typing: true,
    });
  });

  /* Emoji Reaction Events */
  socket.on("send-emoji-reaction", ({ roomId, emoji, position }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const peer = room.getPeer(socket);
    if (!peer) return;

    const reactionData = {
      emoji,
      userId: peer.data.id,
      userName: peer.data.name,
      position,
    };

    socket.to(roomId).emit("receive-emoji-reaction", reactionData);
  });

  /* Raise Hand Events */
  socket.on("raise-hand", ({ roomId }, callback) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const peer = room.getPeer(socket);
    if (!peer) return;

    const raiseHandData = {
      participantId: peer.data.id,
    };

    socket.to(roomId).emit("participant-raised-hand", raiseHandData);
    callback({ id: raiseHandData.participantId });
  });

  socket.on("lower-hand", ({ roomId }, callback) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const peer = room.getPeer(socket);
    if (!peer) return;

    const lowerHandData = {
      participantId: peer.data.id,
    };

    socket.to(roomId).emit("participant-lowered-hand", lowerHandData);
    callback({ id: lowerHandData.participantId });
  });
});
