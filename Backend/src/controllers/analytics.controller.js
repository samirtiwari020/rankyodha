import { buildAnalytics, buildGraph } from "../services/analytics.service.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await buildAnalytics(req.user._id);
  res.json(analytics);
});

export const getGraph = asyncHandler(async (req, res) => {
  const graph = await buildGraph(req.user._id);
  res.json(graph);
});
