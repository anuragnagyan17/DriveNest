import Review from "../models/review.model.js";
import Booking from "../models/booking.js";

export const createReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { carId, bookingId, rating, comment } = req.body;

    if (!carId || !bookingId || !rating || !comment) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(400).json({ success: false, message: "Booking not found" });
    }
    if (booking.user.toString() !== userId.toString()) {
      return res.status(400).json({ success: false, message: "Booking does not belong to you" });
    }
    if (booking.car.toString() !== carId.toString()) {
      return res.status(400).json({ success: false, message: "Booking car does not match" });
    }
    if (booking.status !== "returned") {
      return res.status(400).json({ success: false, message: "Car must be returned before leaving a review" });
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "You already reviewed this booking" });
    }

    const review = await Review.create({
      car: carId,
      user: userId,
      booking: bookingId,
      rating,
      comment
    });

    return res.status(200).json({ success: true, message: "Review submitted", review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCarReviews = async (req, res) => {
  try {
    const { carId } = req.params;
    
    const reviews = await Review.find({ car: carId })
      .populate("user", "name image")
      .sort({ createdAt: -1 });
      
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
      : 0;
      
    return res.status(200).json({ success: true, reviews, avgRating, totalReviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkCanReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { carId } = req.params;
    
    const booking = await Booking.findOne({
      user: userId,
      car: carId,
      status: "returned"
    });
    
    if (!booking) {
      return res.status(200).json({ success: true, canReview: false, bookingId: null });
    }
    
    const existingReview = await Review.findOne({ booking: booking._id });
    
    if (existingReview) {
      return res.status(200).json({ success: true, canReview: false, bookingId: null });
    }
    
    return res.status(200).json({ success: true, canReview: true, bookingId: booking._id });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
