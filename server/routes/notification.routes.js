import express from "express";
import protect from "../middleware/auth.middleware.js";
import { getNotifications, markAsRead } from "../controllers/notification.controller.js";

const notificationRouter = express.Router();

notificationRouter.get("/", getNotifications);
notificationRouter.post("/mark-read", protect, markAsRead);

export default notificationRouter;
