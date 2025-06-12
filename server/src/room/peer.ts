import { Consumer, Producer, Transport } from "mediasoup/node/lib/types";
import { Socket } from "socket.io";

export type UserData = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  isHost: boolean;
};

class Peer {
  socket: Socket;
  data: UserData;

  producerTransport: Transport | undefined;
  audioProducer: Producer | undefined;
  videoProducer: Producer | undefined;
  screenShareProducer: Producer | undefined;

  consumerTransport: Transport | undefined;
  consumers: Map<string, Consumer> | undefined;

  constructor(socket: Socket, data: UserData) {
    this.socket = socket;
    this.data = {
      id: data.id,
      name: data.name,
      email: data.email,
      imageUrl: data.imageUrl,
      isHost: data.isHost,
    };
    this.producerTransport = undefined;
    this.audioProducer = undefined;
    this.videoProducer = undefined;
    this.screenShareProducer = undefined;
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

  addScreenShareProducer(producer: Producer) {
    this.screenShareProducer = producer;
  }

  addConsumerTransport(transport: Transport) {
    this.consumerTransport = transport;
  }

  addConsumer(producerId: string, consumer: Consumer) {
    this.consumers?.set(producerId, consumer);
  }
}

export default Peer;
