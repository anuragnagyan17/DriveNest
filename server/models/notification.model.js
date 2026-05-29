import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const notificationSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["booking_created", "booking_confirmed", "booking_cancelled", "booking_returned"], 
      required: true 
    },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: "" }
  },
  { timestamps: true }
);

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;
