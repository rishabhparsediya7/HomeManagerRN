// socket.ts
import { io } from 'socket.io-client';

const socket = io('https://1222457b3111.ngrok-free.app', {
  transports: ['websocket'],
  autoConnect: false,
});

export default socket;
