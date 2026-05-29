import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const { _id } = req.user;
    const notifications = await Notification.find({ user: _id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { _id } = req.user;
    await Notification.updateMany({ user: _id, isRead: false }, { isRead: true });
    return res.status(200).json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
