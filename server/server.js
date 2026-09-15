import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/mongodb.configs.js";
import userRouter from "./routes/user.routes.js";
import ownerRouter from "./routes/owner.route.js";
import bookingRouter from "./routes/booking.routes.js";
import newsletterRouter from "./routes/newsletter.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import aiRouter from "./routes/ai.routes.js";
import reviewRouter from "./routes/review.routes.js";
import chatRouter from "./routes/chat.routes.js";
import Booking from "./models/booking.js";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/user.model.js";const app = express();
const port = process.env.PORT || 3000;

await connectDB();

app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.startsWith("http://localhost:"))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });

// Socket Authentication Middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return next(new Error("Authentication error: Invalid token"));
    }
    const user = await User.findById(decoded.id).select("role");
    if (!user) {
       return next(new Error("Authentication error: User not found"));
    }
    socket.userId = decoded.id;
    socket.role = user.role;
    next();
  } catch (error) {
    next(new Error("Authentication error: " + error.message));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.userId}`);
  if (socket.role === "owner") {
    socket.join(`owner:${socket.userId}`);
  }

  socket.on("chat:join", async (bookingId) => {
    try {
      const booking = await Booking.findById(bookingId)
        .select("user owner");
      if (!booking) return;
      const userId = socket.userId;
      const isParticipant =
        booking.user.toString() === userId ||
        booking.owner.toString() === userId;
      if (isParticipant) {
        const ids = [
          booking.user.toString(), 
          booking.owner.toString()
        ].sort();
        const conversationId = `${ids[0]}_${ids[1]}`;
        socket.join(`chat:conv:${conversationId}`);
        // Store for leave event
        socket.lastConversationId = conversationId;
      }
    } catch (err) {
      console.error("chat:join error:", err.message);
    }
  });

  socket.on("chat:leave", () => {
    if (socket.lastConversationId) {
      socket.leave(`chat:conv:${socket.lastConversationId}`);
      socket.lastConversationId = null;
    }
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("SERVER IS RUNNING...");
});

app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/ai", aiRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/chat", chatRouter);

server.listen(port, () => {
  console.log(`server is running on port http://localhost:${port}`);
});
