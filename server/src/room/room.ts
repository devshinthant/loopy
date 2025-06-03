import * as mediasoup from "mediasoup";
import { AppData } from "mediasoup/node/lib/types";
import Peer, { UserData } from "./peer";
import { Socket } from "socket.io";

type Router = mediasoup.types.Router<AppData> | undefined;

class Room {
  id: string;
  password: string;
  router: Router;
  peers: Map<string, Peer> | undefined;

  constructor(id: string, password: string, router: Router) {
    this.id = id;
    this.password = password;
    this.router = router;
    this.peers = new Map();
  }

  addPeer(socket: Socket, userData: UserData) {
    this.peers?.set(socket.id, new Peer(socket, userData));
  }

  removePeer(socket: Socket) {
    this.peers?.delete(socket.id);
  }

  getPeer(socket: Socket) {
    return this.peers?.get(socket.id);
  }

  getPeers() {
    return this.peers;
  }
}

export default Room;
