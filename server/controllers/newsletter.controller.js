import Newsletter from "../models/newsletter.model.js";

export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Already subscribed" });
    }

    await Newsletter.create({ email });
    return res.status(200).json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const deleted = await Newsletter.findOneAndDelete({ email });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    return res.status(200).json({ success: true, message: "Unsubscribed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
