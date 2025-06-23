"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../app");
const createTransport = async (roomId, callback) => {
    try {
        const webRtcTransportOptions = {
            listenIps: [
                {
                    ip: "127.0.0.1",
                },
            ],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
        };
        const room = app_1.rooms.get(roomId);
        if (!room) {
            return callback({
                error: "Room not found",
            });
        }
        const transport = await room.router?.createWebRtcTransport(webRtcTransportOptions);
        if (!transport) {
            return callback({
                error: "Failed to create transport",
            });
        }
        transport.on("dtlsstatechange", (dtlsState) => {
            if (dtlsState === "closed") {
                transport.close();
            }
        });
        transport.on("@close", () => {
            console.log("Transport closed");
        });
        callback({
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
        });
        return transport;
    }
    catch (error) {
        console.error("Error creating transport:", error);
        callback({ error: "Error creating transport" });
    }
};
exports.default = createTransport;
