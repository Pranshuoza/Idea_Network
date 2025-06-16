import Notification from "../models/Notification.js";
import { getIO } from "../config/socket.js";

const createNotification = async (req, res) => {
  const { userId, message, relatedStartup } = req.body;

  try {
    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        message: "User ID and message are required",
      });
    }

    const notification = new Notification({
      user: userId,
      message,
      relatedStartup,
    });

    await notification.save();

    // Emit notification to the user via WebSocket
    const io = getIO();
    io.to(userId).emit("notification", notification);

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getNotifications = async (req, res) => {
  const userId = req.user._id;

  try {
    const notifications = await Notification.find({ user: userId })
      .populate("relatedStartup", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
};