import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/** Singleton Socket.IO client for the public site only (not admin). */
let socket = null;

export function connectUserSocket() {
  if (!socket) {
    socket = io(API_URL, {
      query: { client: "public" },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("✅ Connected to server for real-time updates");
      socket.emit("join_public_site");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  if (socket.connected) {
    socket.emit("join_public_site");
  }

  return socket;
}

export function getUserSocket() {
  return socket;
}
