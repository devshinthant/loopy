"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
/**
 * Cleans up the room and peer
 * @param socket - The socket of the peer
 * @param roomId - The id of the room
 * @returns void
 */
const cleanUp = ({ socket, roomId, endRoom = false }) => {
    try {
        if (roomId) {
            const room = app_1.rooms.get(roomId);
            if (!room)
                return;
            const peer = room.getPeer(socket);
            if (!peer)
                return;
            clean(room, peer, socket);
            if (!endRoom) {
                if (peer.videoProducer) {
                    socket.broadcast.emit("producer-update", {
                        producerId: peer.videoProducer.id,
                        kind: "video",
                        type: "remove",
                    });
                }
                if (peer.audioProducer) {
                    socket.broadcast.emit("producer-update", {
                        producerId: peer.audioProducer.id,
                        kind: "audio",
                        type: "remove",
                    });
                }
                if (peer.screenShareProducer) {
                    socket.broadcast.emit("producer-update", {
                        producerId: peer.screenShareProducer.id,
                        kind: "video",
                        screenShare: true,
                        type: "remove",
                    });
                }
            }
            endRoom && end(socket, room);
        }
        else {
            app_1.rooms.forEach((room) => {
                const peer = room.getPeer(socket);
                if (!peer)
                    return;
                clean(room, peer, socket);
                if (!endRoom) {
                    if (peer.videoProducer) {
                        socket.broadcast.emit("producer-update", {
                            producerId: peer.videoProducer.id,
                            kind: "video",
                            type: "remove",
                        });
                    }
                    if (peer.audioProducer) {
                        socket.broadcast.emit("producer-update", {
                            producerId: peer.audioProducer.id,
                            kind: "audio",
                            type: "remove",
                        });
                    }
                    if (peer.screenShareProducer) {
                        socket.broadcast.emit("producer-update", {
                            producerId: peer.screenShareProducer.id,
                            kind: "video",
                            screenShare: true,
                            type: "remove",
                        });
                    }
                }
                endRoom && end(socket, room);
            });
        }
    }
    catch (error) {
        console.log(error);
    }
};
function clean(room, peer, socket) {
    /* Close Producers */
    peer.audioProducer?.close();
    peer.videoProducer?.close();
    peer.screenShareProducer?.close();
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
    socket.to(room.id).emit("participant-left", {
        participantId: peer.data.id,
    });
    console.log("Participant left");
}
function end(socket, room) {
    room.router?.close();
    app_1.rooms.delete(room.id);
    socket.broadcast.emit("room-ended", { roomId: room.id });
    console.log("Server Router closed");
}
exports.default = cleanUp;
