import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let socket = null;

const useSocket = (event, callback) => {
  const savedCallback = useRef();

  // Save the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // Initialize socket connection if not already connected
    if (!socket) {
      socket = io(API_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10
      });

      socket.on('connect', () => {
        console.log('✅ Connected to server for real-time updates');
      });

      socket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }

    // Set up the event listener
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

  return socket;
};

export default useSocket;
