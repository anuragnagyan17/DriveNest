import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/mongodb.configs.js";
import userRouter from "./routes/user.routes.js";
import ownerRouter from "./routes/owner.route.js";
import bookingRouter from "./routes/booking.routes.js";
import newsletterRouter from "./routes/newsletter.routes.js";
import notificationRouter from "./routes/notification.routes.js";

const app = express();
const port = process.env.PORT || 3000;

await connectDB();

app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.startsWith("http://localhost:"))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("SERVER IS RUNNING...");
});

app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/notifications", notificationRouter);

app.listen(port, () => {
  console.log(`server is running on port http://localhost:${port}`);
});
