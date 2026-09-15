import express from "express";
import protect from "../middleware/auth.middleware.js";
import { getMessages, sendMessage } from "../controllers/chat.controller.js";

const chatRouter = express.Router();
chatRouter.get("/:bookingId", protect, getMessages);
chatRouter.post("/send", protect, sendMessage);
export default chatRouter;
