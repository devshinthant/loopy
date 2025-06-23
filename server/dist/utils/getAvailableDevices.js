"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getAvailableDevices = async () => {
    try {
        // First request permission to access media devices
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        // Now enumerate devices after permission is granted
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log({ devices });
        const audioInputs = devices.filter((d) => d.kind === "audioinput");
        const audioOutputs = devices.filter((d) => d.kind === "audiooutput");
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        return { audioInputs, audioOutputs, videoInputs };
    }
    catch (error) {
        console.error("Error accessing media devices:", error);
        throw error;
    }
};
exports.default = getAvailableDevices;
