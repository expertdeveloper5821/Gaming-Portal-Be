import { Server as SocketServer } from 'socket.io';
import { handleSocketConnection } from '../controllers/socketController'; 

export function setupSocketIO(server: any) {
  const io = new SocketServer(server);

  // Called the handleSocketConnection function
  handleSocketConnection(io); 

  return io;
}
