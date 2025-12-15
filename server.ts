import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import express, { Request, Response } from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

// Start the server
server.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});

// Listen to connection from the client
io.on('connection', (socket: Socket) => {
  console.log('A user has connected');
  // Emit a message to the client
  socket.emit('messageFromServer', 'Hello from the server');

  // Listen for a message from the client
  socket.on('messageFromClient', (message: string) => {
    console.log('Received from the client', message);
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve the static files from the public folder
app.use(express.static(join(__dirname, 'public')));

// Serve the assets
app.get('/', (req: Request, res: Response) => {
  res.sendFile(join(__dirname, 'index.html'));
});
