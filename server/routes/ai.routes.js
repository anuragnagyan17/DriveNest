import express from "express";
import { recommendCars } from "../controllers/ai.controller.js";

const aiRouter = express.Router();

aiRouter.post("/recommend", recommendCars);

export default aiRouter;
