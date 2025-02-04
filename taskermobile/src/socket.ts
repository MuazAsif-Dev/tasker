import {io} from 'socket.io-client';
import {env} from '@/config/env';

export const socket = io(env.API_SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
});
