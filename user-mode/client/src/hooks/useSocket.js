import { useEffect, useRef } from 'react';
import { connectUserSocket } from '../socket/userSocket.js';

const useSocket = (event, callback) => {
  const savedCallback = useRef();

  // Save the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const socket = connectUserSocket();

    const eventHandler = (...args) => {
      if (savedCallback.current) {
        savedCallback.current(...args);
      }
    };

    if (event) {
      socket.on(event, eventHandler);
    }

    // Cleanup function
    return () => {
      if (event && socket) {
        socket.off(event, eventHandler);
      }
    };
  }, [event]);

  return connectUserSocket();
};

export default useSocket;
