import { Request, Response } from "express";
import express from "express";
import http from "http";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

const server = http.createServer(app);

server.listen(4000, () => {
  console.log("HTTP Server is running on port 4000");
});

export default server;
