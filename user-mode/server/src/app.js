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

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);
  
  // Listen for admin updates and broadcast to all clients
  socket.on("admin_update", (data) => {
    console.log(`📡 Broadcasting ${data.event} to all clients`);
    io.emit(data.event, data.data);
  });
  
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`User server running on port ${PORT}`);
  console.log(`Socket.IO server ready for real-time updates`);
});
