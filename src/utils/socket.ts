// socket.ts
import { io } from 'socket.io-client';

const socket = io('https://0e622c717fbb.ngrok-free.app', {
  transports: ['websocket'],
  autoConnect: false,
});

export default socket;
