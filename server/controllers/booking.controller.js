import Booking from "../models/booking.js";
import Car from "../models/car.model.js";
import Notification from "../models/notification.model.js";

const checkAvailability = async (car, pickupDate, returnDate) => {
  const bookings = await Booking.find({
    car,
    pickupDate: { $lte: returnDate },
    returnDate: { $gte: pickupDate },
    status: { $in: ["pending", "confirmed"] },
  });
  return bookings.length === 0;
};

export const checkAvailabilityOfCar = async (req, res) => {
  try {
    const { location, pickupDate, returnDate } = req.body;
    const cars = await Car.find({ location, isAvaliable: true });
    const availableCarsPromises = cars.map(async (car) => {
      const isAvaliable = await checkAvailability(
        car._id,
        pickupDate,
        returnDate
      );
      return { ...car._doc, isAvaliable: isAvaliable };
    });

    let availableCars = await Promise.all(availableCarsPromises);
    availableCars = availableCars.filter((car) => car.isAvaliable === true);
    return res.json({ success: true, availableCars });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const { car, pickupDate, returnDate } = req.body;
    const isAvaliable = await checkAvailability(car, pickupDate, returnDate);
    if (!isAvaliable) {
      return res.json({ success: false, message: "Car is not available" });
    }
    const carData = await Car.findById(car);

    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);
    const noOfDays = Math.ceil(returned - picked) / (1000 * 60 * 60 * 24);
    const price = carData.pricePerDay * noOfDays;

    const booking = await Booking.create({
      car,
      owner: carData.owner,
      user: _id,
      pickupDate,
      returnDate,
      price,
    });

    await Notification.create({
      user: carData.owner,
      message: `You have a new booking request for ${carData.brand} ${carData.model}.`,
      type: "booking_created",
      link: "/owner/manage-bookings"
    });

    req.io.to(`owner:${carData.owner.toString()}`).emit('booking:new', { 
      message: `New booking request for ${carData.brand} ${carData.model}` 
    });

    return res.json({ success: true, message: "Booking Created" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const { _id } = req.user;
    const bookings = await Booking.find({ user: _id })
      .populate({ 
        path: "car", 
        populate: { path: "owner", select: "name email image" } 
      })
      .sort({ createdAt: -1 });
    return res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getOwnerBookings = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.json({ success: false, message: "Unauthorized" });
    }
    const bookings = await Booking.find({ owner: req.user._id })
      .populate("car user")
      .select("-user.password")
      .sort({ createdAt: -1 });
    return res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const changeBookingStatus = async (req, res) => {
  try {
    const { _id } = req.user;
    const { bookingId, status } = req.body;
    const booking = await Booking.findById(bookingId);

    if (
      booking.owner.toString() !== _id.toString() &&
      booking.user.toString() !== _id.toString()
    ) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    if (status === "returned" && booking.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Only owner can mark as returned" });
    }

    booking.status = status;
    await booking.save();

    if (status === "confirmed") {
      await Car.findByIdAndUpdate(booking.car, { isAvaliable: false });
    } else if (status === "cancelled" || status === "returned") {
      await Car.findByIdAndUpdate(booking.car, { isAvaliable: true });
    }

    const recipient = booking.owner.toString() === _id.toString() ? booking.user : booking.owner;
    let message = "";
    if (status === "confirmed") message = "Your booking has been confirmed!";
    else if (status === "cancelled") message = "A booking has been cancelled.";
    else if (status === "returned") message = "Your rental has been marked as returned.";

    await Notification.create({
      user: recipient,
      message,
      type: `booking_${status}`,
      link: booking.owner.toString() === _id.toString() ? "/my-bookings" : "/owner/manage-bookings"
    });

    req.io.to(`user:${recipient.toString()}`).emit('booking:statusChanged', { 
      message 
    });

    return res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
