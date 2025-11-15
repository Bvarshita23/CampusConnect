import Notification from "../models/Notification.js";

// ✅ Fetch current user's notifications
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10); // latest 10

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({
      success: true,
      count: unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("getMyNotifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// ✅ Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications",
    });
  }
};

// ✅ Utility: create notification (for other modules)
export const createNotification = async (userId, message, type = "general") => {
  try {
    await Notification.create({ user: userId, message, type });
  } catch (error) {
    console.error("createNotification error:", error.message);
  }
};
