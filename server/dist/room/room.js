"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const peer_1 = __importDefault(require("./peer"));
class Room {
    constructor(id, password, router) {
        this.id = id;
        this.password = password;
        this.router = router;
        this.peers = new Map();
        this.createdAt = Date.now();
    }
    addPeer(socket, userData) {
        this.peers?.set(socket.id, new peer_1.default(socket, userData));
    }
    removePeer(socket) {
        this.peers?.delete(socket.id);
    }
    getPeer(socket) {
        return this.peers?.get(socket.id);
    }
    getPeers() {
        return this.peers;
    }
}
exports.default = Room;
