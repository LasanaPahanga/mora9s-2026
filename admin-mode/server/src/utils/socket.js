import { io } from "socket.io-client";

// Connect to user-mode server for emitting real-time updates (must match user server URL/port).
const USER_SERVER_URL = process.env.USER_SERVER_URL || "http://localhost:4000";

let socket = null;

/** Single client instance; Socket.IO handles reconnect. Handshake marks us as admin relay (see user-mode server). */
export const connectToUserServer = () => {
  if (!socket) {
    socket = io(USER_SERVER_URL, {
      query: { client: "admin_relay" },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("✅ Admin server connected to User server for real-time updates");
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Admin server disconnected from User server:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error (admin → user):", error.message);
    });
  }

  return socket;
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Forward an event to public-site Socket.IO clients via the user-mode server.
 * Retries while the relay is offline so bursts after deploy are less likely dropped.
 */
export const emitToUsers = async (event, data) => {
  connectToUserServer();

  const maxWaitMs = 12_000;
  const stepMs = 350;
  let waited = 0;

  while (waited <= maxWaitMs) {
    if (socket?.connected) {
      socket.emit("admin_update", { event, data });
      console.log(`📡 Emitted ${event} to user clients`);
      return;
    }
    await sleep(stepMs);
    waited += stepMs;
  }

  console.error(
    `❌ emitToUsers dropped "${event}": admin relay not connected to ${USER_SERVER_URL} after ${maxWaitMs}ms`
  );
};

export default { connectToUserServer, emitToUsers };
