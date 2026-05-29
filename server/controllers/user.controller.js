import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { response } from "express";
import jwt from "jsonwebtoken";
import Car from "../models/car.model.js";

const generateToken = (userId) => {
  const payload = userId;
  return jwt.sign({ id: payload }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing fields required",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });

    const token = generateToken(user._id.toString());

    return res.status(200).json({
      token,
      success: true,
      message: "Register Successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "Missing fields required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id.toString());
    return res.status(200).json({
      token,
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get user data using token (JWT)

export const getUserData = async (req, res) => {
  try {
    const { user } = req;
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCars = async (req, res) => {
  try {
    const { page: queryPage, limit: queryLimit, location } = req.query;
    const page = parseInt(queryPage) || 1;
    const limit = parseInt(queryLimit) || 9;
    const skip = (page - 1) * limit;
    
    const filter = { isAvaliable: true };
    if (location) filter.location = location;
    
    const total = await Car.countDocuments(filter);
    const cars = await Car.find(filter)
      .populate("owner", "-password")
      .skip(skip)
      .limit(limit);
    return res.status(200).json({
      success: true,
      cars,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecentCars = async (req, res) => {
  try {
    const cars = await Car.find({ isAvaliable: true })
      .populate("owner", "-password")
      .sort({ createdAt: -1 })
      .limit(6);
    return res.status(200).json({ success: true, cars });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
