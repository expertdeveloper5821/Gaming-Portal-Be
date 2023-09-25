import { Server as SocketServer } from 'socket.io';

export function setupSocketIO(server: any) {
  const io = new SocketServer(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join-team', (teamId) => {
      socket.join(teamId);
    });

    socket.on('invitation-accepted', (teamId, userId) => {
      socket.to(teamId).emit('user-joined', userId);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  return io; 
}
