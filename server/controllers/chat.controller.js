import Message from "../models/message.model.js";
import Booking from "../models/booking.js";
import { redisGet, redisSet, redisDel } from "../configs/redis.js";

const getConversationId = (userId, ownerId) => {
  const ids = [userId.toString(), ownerId.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

export const getMessages = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const userId = req.user._id.toString();

    const booking = await Booking.findById(bookingId).select("user owner");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.user.toString() !== userId && booking.owner.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const conversationId = getConversationId(booking.user, booking.owner);
    const cacheKey = `chat:conv:${conversationId}`;
    const cached = await redisGet(cacheKey);
    if (cached) {
      return res.json({ success: true, messages: JSON.parse(cached), fromCache: true });
    }

    const fetchedMessages = await Message.find({ conversationId })
      .populate("sender", "name image")
      .sort({ createdAt: -1 })
      .limit(50);
      
    const messages = fetchedMessages.reverse();

    await redisSet(cacheKey, JSON.stringify(messages), 300);
    return res.json({ success: true, messages, fromCache: false });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { bookingId, text } = req.body;
    const userId = req.user._id;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "bookingId is required" });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "text is required" });
    }

    const booking = await Booking.findById(bookingId).select("user owner");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.user.toString() !== userId.toString() && booking.owner.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const senderRole = booking.owner.toString() === userId.toString() ? "owner" : "user";
    const conversationId = getConversationId(booking.user, booking.owner);

    const message = await Message.create({
      booking: bookingId,
      conversationId,
      sender: userId,
      senderRole,
      text: text.trim()
    });

    await message.populate("sender", "name image");

    await redisDel(`chat:conv:${conversationId}`);

    req.io.to(`chat:conv:${conversationId}`).emit("chat:message", message);

    return res.json({ success: true, message });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
