import { Consumer, Producer, Transport } from "mediasoup/node/lib/types";
import { Socket } from "socket.io";

class Peer {
  socket: Socket;

  producerTransport: Transport | undefined;
  producer: Producer | undefined;

  consumerTransports: Map<string, Transport> | undefined;
  consumers: Map<string, Consumer> | undefined;

  constructor(socket: Socket) {
    this.socket = socket;
    this.producerTransport = undefined;
    this.producer = undefined;
    this.consumerTransports = new Map();
    this.consumers = new Map();
  }

  addConsumerTransport(id: string, transport: Transport) {
    this.consumerTransports?.set(id, transport);
  }

  addConsumer(id: string, consumer: Consumer) {
    this.consumers?.set(id, consumer);
  }

  addProducer(producer: Producer) {
    this.producer = producer;
  }

  addProducerTransport(transport: Transport) {
    this.producerTransport = transport;
  }
}

export default Peer;
