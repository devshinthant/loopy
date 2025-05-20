import { Consumer, Producer, Transport } from "mediasoup/node/lib/types";
import { Socket } from "socket.io";

class Peer {
  socket: Socket;

  producerTransport: Transport | undefined;
  audioProducer: Producer | undefined;
  videoProducer: Producer | undefined;

  consumerTransport: Transport | undefined;
  consumers: Map<string, Consumer> | undefined;

  constructor(socket: Socket) {
    this.socket = socket;
    this.producerTransport = undefined;
    this.audioProducer = undefined;
    this.videoProducer = undefined;
    this.consumerTransport = undefined;
    this.consumers = new Map();
  }

  addProducerTransport(transport: Transport) {
    this.producerTransport = transport;
  }

  addAudioProducer(producer: Producer) {
    this.audioProducer = producer;
  }

  addVideoProducer(producer: Producer) {
    this.videoProducer = producer;
  }

  addConsumerTransport(transport: Transport) {
    this.consumerTransport = transport;
  }

  addConsumer(producerId: string, consumer: Consumer) {
    this.consumers?.set(producerId, consumer);
  }
}

export default Peer;
