import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import teamsRoutes from "./routes/teamsRoutes.js";
import groupsRoutes from "./routes/groupsRoutes.js";
import matchesRoutes from "./routes/matchesRoutes.js";
import resultsRoutes from "./routes/resultsRoutes.js";
import goalScorersRoutes from "./routes/goalScorersRoutes.js";
import cardPenaltiesRoutes from "./routes/cardPenaltiesRoutes.js";
import { connectToUserServer } from "./utils/socket.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/admin/auth", authRoutes);
app.use("/admin/teams", teamsRoutes);
app.use("/admin/groups", groupsRoutes);
app.use("/admin/matches", matchesRoutes);
app.use("/admin/results", resultsRoutes);
app.use("/admin", goalScorersRoutes);
app.use("/admin", cardPenaltiesRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Mora 9s 2026 Admin API" });
});

app.listen(PORT, () => {
  console.log(`Admin server running on port ${PORT}`);
  
  // Connect to user-mode server for real-time updates
  setTimeout(() => {
    connectToUserServer();
  }, 1000);
});
