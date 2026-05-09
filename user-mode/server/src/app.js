import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { PORT } from "./config/env.js";
import groupsRoutes from "./routes/groupsRoutes.js";
import teamsRoutes from "./routes/teamsRoutes.js";
import matchesRoutes from "./routes/matchesRoutes.js";
import resultsRoutes from "./routes/resultsRoutes.js";
import pointsRoutes from "./routes/pointsRoutes.js";
import topScorersRoutes from "./routes/topScorersRoutes.js";

const app = express();
const httpServer = createServer(app);

// Setup Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Export io for use in other modules
export { io };

app.use(cors());
app.use(express.json());

app.use("/api/groups", groupsRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/matches", matchesRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/points", pointsRoutes);
app.use(topScorersRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Mora 9s 2026 User API" });
});

const PUBLIC_SITE_ROOM = "public_site";

function broadcastPublicViewerCount() {
  const room = io.sockets.adapter.rooms.get(PUBLIC_SITE_ROOM);
  const n = room ? room.size : 0;
  io.to(PUBLIC_SITE_ROOM).emit("viewer_count", n);
}

function isAdminRelay(socket) {
  return socket.handshake?.query?.client === "admin_relay";
}

// Socket.IO connection handling
io.on("connection", (socket) => {
  const relay = isAdminRelay(socket);
  console.log(`✅ Client connected: ${socket.id} (${relay ? "admin relay" : "public"})`);

  if (!relay) {
    socket.join(PUBLIC_SITE_ROOM);
    broadcastPublicViewerCount();
  }

  socket.on("join_public_site", () => {
    socket.join(PUBLIC_SITE_ROOM);
    broadcastPublicViewerCount();
  });

  // Admin API emits here; fan out only to browsers in public_site (not the relay connection).
  socket.on("admin_update", (payload) => {
    if (!payload || typeof payload.event !== "string") {
      console.warn("⚠️ Ignoring invalid admin_update payload");
      return;
    }
    io.to(PUBLIC_SITE_ROOM).emit(payload.event, payload.data);
    console.log(`📡 Broadcast ${payload.event} → room ${PUBLIC_SITE_ROOM}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    setImmediate(() => broadcastPublicViewerCount());
  });
});

httpServer.listen(PORT, () => {
  console.log(`User server running on port ${PORT}`);
  console.log(`Socket.IO server ready for real-time updates`);
});
