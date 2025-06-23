"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.get("/", (req, res) => {
    res.send("Hello World");
});
const server = http_1.default.createServer(app);
server.listen(4000, () => {
    console.log("HTTP Server is running on port 4000");
});
exports.default = server;
