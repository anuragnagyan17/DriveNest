import express from "express";
import protect from "../middleware/auth.middleware.js";
import {
  addCar,
  changeRoleOwner,
  deleteCar,
  getDashboardData,
  getOwnerCars,
  toggleCarAvailability,
  updateUserImage,
  updateCar,
} from "../controllers/owner.controller.js";
import upload from "../middleware/multer.middleware.js";

const ownerRouter = express.Router();

ownerRouter.post("/change-role", protect, changeRoleOwner);
ownerRouter.post("/add-car", upload.single("image"), protect, addCar);
ownerRouter.get("/cars", protect, getOwnerCars);
ownerRouter.post("/toggle-car", protect, toggleCarAvailability);
ownerRouter.post("/delete-car", protect, deleteCar);
ownerRouter.get("/dashboard", protect, getDashboardData);
ownerRouter.post(
  "/update-image",
  upload.single("image"),
  protect,
  updateUserImage
);
ownerRouter.put("/update-car", upload.single("image"), protect, updateCar);

export default ownerRouter;
