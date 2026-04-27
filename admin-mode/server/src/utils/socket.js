import { io } from "socket.io-client";

// Connect to user-mode server for emitting real-time updates
const USER_SERVER_URL = process.env.USER_SERVER_URL || "http://localhost:4000";

let socket = null;

export const connectToUserServer = () => {
  if (!socket || !socket.connected) {
    socket = io(USER_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    socket.on("connect", () => {
      console.log("✅ Admin server connected to User server for real-time updates");
    });

    socket.on("disconnect", () => {
      console.log("❌ Admin server disconnected from User server");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
  }

  return socket;
};

// Emit events to user-mode clients
export const emitToUsers = (event, data) => {
  if (socket && socket.connected) {
    socket.emit("admin_update", { event, data });
    console.log(`📡 Emitted ${event} to user clients`);
  } else {
    console.warn("⚠️ Socket not connected. Attempting to reconnect...");
    connectToUserServer();
    setTimeout(() => {
      if (socket && socket.connected) {
        socket.emit("admin_update", { event, data });
      }
    }, 1000);
  }
};

export default { connectToUserServer, emitToUsers };
