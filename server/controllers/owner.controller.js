import Booking from "../models/booking.js";
import Car from "../models/car.model.js";
import User from "../models/user.model.js";
import fs from "fs";
import { uploadToImageKit } from "../configs/imagKit.js";

export const changeRoleOwner = async (req, res) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { role: "owner" });
    return res.status(200).json({
      success: true,
      message: "Now you can list cars",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addCar = async (req, res) => {
  try {
    const { _id } = req.user;
    let car = JSON.parse(req.body.carData);

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }
    
    const image = await uploadToImageKit(req.file.path, req.file.filename);
    fs.unlinkSync(req.file.path);
    
    await Car.create({ ...car, owner: _id, image });

    return res.status(200).json({
      success: true,
      message: "Car Added",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOwnerCars = async (req, res) => {
  try {
    const { _id } = req.user;
    const cars = await Car.find({ owner: _id });
    return res.status(200).json({ success: true, message: "Cars List", cars });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleCarAvailability = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);
    if (car.owner.toString() !== _id.toString()) {
      return res.status(404).json({ success: false, message: "Unauthorized" });
    }
    car.isAvaliable = !car.isAvaliable;
    await car.save();
    return res
      .status(200)
      .json({ success: true, message: "Availability Updated" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);
    if (car.owner.toString() !== _id.toString()) {
      return res.status(404).json({ success: false, message: "Unauthorized" });
    }
    await Car.findByIdAndDelete(carId);
    return res.status(200).json({ success: true, message: "Car Removed" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role !== "owner") {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const cars = await Car.find({ owner: _id });
    const bookings = await Booking.find({ owner: _id })
      .populate("car")
      .sort({ createdAt: -1 });
    const pendingBookings = await Booking.find({
      owner: _id,
      status: "pending",
    });
    const completedBookings = await Booking.find({
      owner: _id,
      status: "confirmed",
    });
    const now = new Date();
    const monthlyRevenue = bookings
      .filter((b) => {
        const d = new Date(b.createdAt);
        return (
          b.status === "confirmed" &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((acc, b) => acc + b.price, 0);

    const dashboardData = {
      totalCars: cars.length,
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      completedBookings: completedBookings.length,
      recentBookings: bookings.slice(0, 3),
      monthlyRevenue,
    };
    return res.json({ success: true, dashboardData });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserImage = async (req, res) => {
  try {
    const { _id } = req.user;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }
    
    const image = await uploadToImageKit(req.file.path, req.file.filename);
    fs.unlinkSync(req.file.path);
    
    await User.findByIdAndUpdate(_id, { image });
    return res.json({ success: true, message: "Image Updated" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    let carData = JSON.parse(req.body.carData);
    
    const car = await Car.findById(carId);
    if (!car || car.owner.toString() !== _id.toString()) {
      return res.status(404).json({ success: false, message: "Unauthorized" });
    }

    if (req.file) {
      carData.image = await uploadToImageKit(req.file.path, req.file.filename);
      fs.unlinkSync(req.file.path);
    }
    
    const updatedCar = await Car.findByIdAndUpdate(carId, { ...carData }, { new: true });
    
    return res.status(200).json({ success: true, message: "Car Updated", car: updatedCar });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
