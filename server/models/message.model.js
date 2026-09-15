import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const messageSchema = new mongoose.Schema({
  booking: { type: ObjectId, ref: "Booking", required: true },
  conversationId: { type: String, required: true, index: true },
  sender: { type: ObjectId, ref: "User", required: true },
  senderRole: { type: String, enum: ["user", "owner"], required: true },
  text: { type: String, required: true, maxlength: 1000 },
}, { timestamps: true });

const Message = mongoose.models.Message || 
  mongoose.model("Message", messageSchema);
export default Message;
