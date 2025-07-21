import { Request, Response } from "express";
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

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

// Create HTTP server
const httpServer = http.createServer(app);

try {
  httpServer.listen(process.env.PORT, () => {
    console.log(`HTTPS Server is running on port ${process.env.PORT}`);
  });
} catch (error) {
  console.log("SSL certificates not found, running HTTP only");
}

export default httpServer;
