import connectDB from "./configs/mongodb.configs.js";
import Booking from "./models/booking.js";
import "dotenv/config";
await connectDB();
const bookings = await Booking.find({});
console.log(bookings);
process.exit(0);
