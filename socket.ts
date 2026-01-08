import { Server, Socket } from 'socket.io';
import { SocketNotifications } from './enums/socket-notifications.enum';
import { SocketEvents } from './enums/socket-events.enum';

export const socketIo = (io: Server) => {
  // Store connected users with their room information
  // using socket.id as their key
  const connectedUsers = new Map();

  /* Handle new socket connnections */
  io.on(SocketEvents.Connection, (socket: Socket) => {
    const user = socket.handshake.auth.user;
    console.log('User connected', user?.username);

    /* Join room handler */
    socket.on(SocketEvents.JoinRoom, (groupId: string) => {
      // Add socket to the specified room
      socket.join(groupId);
      // Store user and room info in connectedUsers
      connectedUsers.set(socket.id, { user, room: groupId });
      // Get list of all users currently in the room
      const usersInRoom = Array.from(connectedUsers.values())
        .filter((user) => user.room === groupId)
        .map((user) => user.user);
      // Emit updated users list to all clients in the room
      io.in(groupId).emit(SocketEvents.UsersInRoom, usersInRoom);
      // Broadcast join notification to all other users in the room
      socket.to(groupId).emit(SocketEvents.Notification, {
        type: SocketNotifications.UserJoined,
        message: `${user?.username} has joined`,
        user: user,
      });
    });

    /* Leave room handler */
    // This is triggered when a user manually leaves a room
    socket.on(SocketEvents.LeaveRoom, (groupId: string) => {
      console.log(`${user?.username} leaving room:`, groupId);
      // Remove socket from the room
      socket.leave(groupId);
      if (connectedUsers.has(socket.id)) {
        // Remove user from connectedUsers and notify others
        connectedUsers.delete(socket.id);
        socket.to(groupId).emit(SocketEvents.UserLeft, user?._id);
      }
    });

    // New message handler
    // Disconnect handler
    // Typing indicator
  });
};
