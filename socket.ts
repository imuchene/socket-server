import { Server } from 'socket.io';

export const socketIo = (io: Server) => {
  console.log('socket server eventnames', io.eventNames());
};
