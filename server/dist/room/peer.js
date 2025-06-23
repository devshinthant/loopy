"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Peer {
    constructor(socket, data) {
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
    addProducerTransport(transport) {
        this.producerTransport = transport;
    }
    addAudioProducer(producer) {
        this.audioProducer = producer;
    }
    addVideoProducer(producer) {
        this.videoProducer = producer;
    }
    addScreenShareProducer(producer) {
        this.screenShareProducer = producer;
    }
    addConsumerTransport(transport) {
        this.consumerTransport = transport;
    }
    addConsumer(producerId, consumer) {
        this.consumers?.set(producerId, consumer);
    }
}
exports.default = Peer;
