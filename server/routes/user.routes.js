import express from "express";
import {
  getCars,
  getUserData,
  loginUser,
  registerUser,
  getRecentCars,
  googleAuth,
} from "../controllers/user.controller.js";
import protect from "../middleware/auth.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/google-auth", googleAuth);
userRouter.get("/data", protect, getUserData);
userRouter.get("/cars", getCars);
userRouter.get("/recent-cars", getRecentCars);

export default userRouter;
