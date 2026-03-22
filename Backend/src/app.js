import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import plannerRoutes from "./routes/planner.routes.js";
import practiceRoutes from "./routes/practice.routes.js";
import revisionRoutes from "./routes/revision.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import doubtRoutes from "./routes/doubt.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import gamificationRoutes from "./routes/gamification.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import onePagerRoutes from "./routes/onePager.routes.js";
import studyPlanRoutes from "./routes/studyPlan.routes.js";

const app = express();

app.use(cors({ origin: env.CLIENT_ORIGIN === "*" ? true : env.CLIENT_ORIGIN }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "study-companion-backend" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/planner", plannerRoutes);
app.use("/api/v1/practice", practiceRoutes);
app.use("/api/v1/revision", revisionRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/doubts", doubtRoutes);
app.use("/api/v1/notes", notesRoutes);
app.use("/api/v1/gamification", gamificationRoutes);
app.use("/api/v1/interview", interviewRoutes);
app.use("/api/v1/onepager", onePagerRoutes);
app.use("/api/study-plan", studyPlanRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
