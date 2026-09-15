import express from "express";
import { Router } from "express";
import protect from "../middleware/auth.middleware.js";
import { createReview, getCarReviews, checkCanReview, deleteReview, updateReview } from "../controllers/review.controller.js";

const reviewRouter = express.Router();

reviewRouter.post("/", protect, createReview);
reviewRouter.get("/:carId", getCarReviews);
reviewRouter.get("/can-review/:carId", protect, checkCanReview);
reviewRouter.delete("/:reviewId", protect, deleteReview);
reviewRouter.put("/:reviewId", protect, updateReview);

export default reviewRouter;
