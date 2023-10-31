import { Server as SocketServer } from 'socket.io';
import { user as User } from '../models/passportModels'; 

export const handleSocketConnection = (io: SocketServer) => {
  io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle the 'get-user-status' event
    socket.on('get-user-status', async (data) => {
      const { userId } = data;
      const user = await User.findOne({ _id: userId });
      if (user) {
        const isOnline = user.isOnline;
        // Emit the 'user-status-update' event with the latest user status
        io.emit('user-status-update', { userId, isOnline });
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};


