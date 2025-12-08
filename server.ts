import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`)
})

