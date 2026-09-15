import express from "express";
import { recommendCars } from "../controllers/ai.controller.js";
import rateLimitAI from "../middleware/rateLimit.middleware.js";

const aiRouter = express.Router();

aiRouter.post("/recommend", rateLimitAI, recommendCars);

export default aiRouter;
