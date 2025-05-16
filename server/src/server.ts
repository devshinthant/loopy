import { Request, Response } from "express";
import express from "express";
import https from "https";
import fs from "fs";
import path from "path";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

const options = {
  key: fs.readFileSync(path.join(__dirname, "/certs/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "/certs/cert.pem")),
};

const server = https.createServer(options, app);

server.listen(3000, () => {
  console.log("HTTPS Server is running on port 3000");
});

export default server;
