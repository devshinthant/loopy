import { Socket } from "socket.io";
import { rooms } from "./app";
import Room from "./room/room";
import Peer from "./room/peer";

interface CleanUpProps {
  socket: Socket;
  roomId?: string;
  endRoom?: boolean;
}

/**
 * Cleans up the room and peer
 * @param socket - The socket of the peer
 * @param roomId - The id of the room
 * @returns void
 */

const cleanUp = ({ socket, roomId, endRoom = false }: CleanUpProps) => {
  try {
    if (roomId) {
      const room = rooms.get(roomId);
      if (!room) return;

      const peer = room.getPeer(socket);
      if (!peer) return;

      clean(room, peer, socket);
      if (!endRoom) {
        socket.broadcast.emit("producer-update", {
          producerId: peer.videoProducer?.id,
          kind: "both",
          type: "remove",
        });
      }
      endRoom && end(socket, room);
    } else {
      rooms.forEach((room) => {
        const peer = room.getPeer(socket);
        if (!peer) return;
        clean(room, peer, socket);
        if (!endRoom) {
          socket.broadcast.emit("producer-update", {
            producerId: peer.videoProducer?.id,
            kind: "both",
            type: "remove",
          });
        }
        endRoom && end(socket, room);
      });
    }
  } catch (error) {
    console.log(error);
  }
};

function clean(room: Room, peer: Peer, socket: Socket) {
  /* Close Producers */
  peer.audioProducer?.close();
  peer.videoProducer?.close();
  console.log("Producers closed");

  /* Close Consumers */
  peer.consumers?.forEach((consumer) => {
    consumer.close();
  });
  console.log("Consumers closed");

  /* Close Transports */
  peer.producerTransport?.close();
  peer.consumerTransport?.close();
  console.log("Transports closed");

  /* Remove Peer */
  room.removePeer(socket);
  console.log("Peer removed");
}

function end(socket: Socket, room: Room) {
  room.router?.close();
  rooms.delete(room.id);
  socket.broadcast.emit("room-ended", { roomId: room.id });
  console.log("Server Router closed");
}

export default cleanUp;
