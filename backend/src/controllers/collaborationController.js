import Collaboration from "../models/Collaboration.js";
import Idea from "../models/Idea.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { getIO } from "../config/socket.js";

const getCollaborationsForIdea = async (req, res) => {
  const { ideaId } = req.params;

  try {
    if (!mongoose.isValidObjectId(ideaId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid idea ID" });
    }

    const collaborations = await Collaboration.find({ idea: ideaId })
      .populate("user", "name email") // Updated to match User model fields
      .populate("idea", "title"); // Updated to match Idea model fields

    res.status(200).json({ success: true, data: collaborations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const requestCollaboration = async (req, res) => {
  const { ideaId, role, message } = req.body;
  const userId = req.user.id;

  try {
    if (!mongoose.isValidObjectId(ideaId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid idea ID" });
    }

    if (!ideaId || !role) {
      return res
        .status(400)
        .json({ success: false, message: "Idea ID and role are required" });
    }

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });
    }

    if (idea.creator.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Creator cannot request collaboration",
      });
    }

    const collaboration = new Collaboration({
      idea: ideaId,
      user: userId,
      role,
      message: message || "",
    });

    await collaboration.save();

    const populatedCollaboration = await Collaboration.findById(
      collaboration._id
    )
      .populate("user", "name email") // Updated to match User model fields
      .populate("idea", "title"); // Updated to match Idea model fields

    getIO().emit("newCollaborationRequest", populatedCollaboration); // Emit new request event

    res.status(201).json({ success: true, data: populatedCollaboration });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Request already sent" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveCollaboration = async (req, res) => {
  const { collaborationId } = req.params;
  const userId = req.user.id;

  try {
    if (!mongoose.isValidObjectId(collaborationId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid collaboration ID" });
    }

    const collaboration = await Collaboration.findById(collaborationId);
    if (!collaboration) {
      return res
        .status(404)
        .json({ success: false, message: "Collaboration not found" });
    }

    const idea = await Idea.findById(collaboration.idea);
    if (!idea) {
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });
    }

    if (idea.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the idea creator can approve collaborations",
      });
    }

    collaboration.status = "accepted";
    await collaboration.save();

    if (!idea.collaborators.includes(collaboration.user)) {
      idea.collaborators.push(collaboration.user);
      await idea.save();
    }

    const populatedCollaboration = await Collaboration.findById(
      collaboration._id
    )
      .populate("user", "name email") // Updated to match User model fields
      .populate("idea", "title"); // Updated to match Idea model fields

    getIO().emit("collaborationStatusUpdate", {
      type: "approved",
      collaboration: populatedCollaboration,
    }); // Emit approval event

    res.status(200).json({ success: true, data: populatedCollaboration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectCollaboration = async (req, res) => {
  const { collaborationId } = req.params;
  const userId = req.user.id;

  try {
    if (!mongoose.isValidObjectId(collaborationId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid collaboration ID" });
    }

    const collaboration = await Collaboration.findById(collaborationId);
    if (!collaboration) {
      return res
        .status(404)
        .json({ success: false, message: "Collaboration not found" });
    }

    const idea = await Idea.findById(collaboration.idea);
    if (!idea) {
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });
    }

    if (idea.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the idea creator can reject collaborations",
      });
    }

    collaboration.status = "rejected";
    await collaboration.save();

    const populatedCollaboration = await Collaboration.findById(
      collaboration._id
    )
      .populate("user", "name email") // Updated to match User model fields
      .populate("idea", "title"); // Updated to match Idea model fields

    getIO().emit("collaborationStatusUpdate", {
      type: "rejected",
      collaboration: populatedCollaboration,
    }); // Emit rejection event

    res.status(200).json({ success: true, data: populatedCollaboration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const withdrawCollaboration = async (req, res) => {
  const { collaborationId } = req.params;
  const userId = req.user.id;

  try {
    if (!mongoose.isValidObjectId(collaborationId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid collaboration ID" });
    }

    const collaboration = await Collaboration.findById(collaborationId);
    if (!collaboration) {
      return res
        .status(404)
        .json({ success: false, message: "Collaboration not found" });
    }

    if (collaboration.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the requester can withdraw this collaboration",
      });
    }

    if (collaboration.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw a collaboration with ${collaboration.status} status`,
      });
    }

    collaboration.status = "withdrawn";
    await collaboration.save();

    const populatedCollaboration = await Collaboration.findById(
      collaboration._id
    )
      .populate("user", "name email") // Updated to match User model fields
      .populate("idea", "title");

    getIO().emit("collaborationStatusUpdate", {
      type: "withdrawn",
      collaboration: populatedCollaboration,
    }); // Emit withdrawal event

    res.status(200).json({ success: true, data: populatedCollaboration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getCollaborationsForIdea,
  requestCollaboration,
  approveCollaboration,
  rejectCollaboration,
  withdrawCollaboration,
};
