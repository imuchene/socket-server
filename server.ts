import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { socketIo } from './socket';
import { userRouter } from './routes/user-routes';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [String(process.env.FRONTEND_URL)],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
const port = process.env.PORT || 5000;

// Start the server
server.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
mongoose
  .connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`, {
    dbName: process.env.MONGO_DATABASE,
    auth: {
      username: process.env.MONGO_USERNAME,
      password: process.env.MONGO_PASSWORD,
    },
  })
  .then(() => console.log('Connected to DB'))
  .catch((err) => console.error('MongoDB connection failed', err));

// Initialize Socket.io
socketIo(io);

app.use('/api/users', userRouter);
