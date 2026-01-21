import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors, { CorsOptions } from 'cors';
import mongoose from 'mongoose';
import { socketIo } from './socket';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { userRouter } from './routes/user-routes';
import { groupRouter } from './routes/group-routes';
import { messageRouter } from './routes/message-routes';

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
const corsOptions: CorsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true, // Needed for secure cookies
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET)); // Needed for secure cookies

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// App routes
app.use('/api/users', userRouter);
app.use('/api/groups', groupRouter);
app.use('/api/messages', messageRouter);
