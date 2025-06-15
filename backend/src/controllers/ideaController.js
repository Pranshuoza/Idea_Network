import Idea from "../models/Idea.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { getIO } from "../config/socket.js";

const getAllIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find()
      .populate("creator", "name email") // Updated to match User model fields
      .populate("collaborators", "name") // Updated to match User model fields
      .lean(); // Optimize for read-heavy operations
    res.status(200).json({ success: true, data: ideas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getIdeaById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid idea ID" });
    }
    const idea = await Idea.findById(req.params.id)
      .populate("creator", "name email") // Updated to match User model fields
      .populate("collaborators", "name"); // Updated to match User model fields
    if (!idea) {
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });
    }
    res.status(200).json({ success: true, data: idea });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createIdea = async (req, res) => {
  const { title, description, tags } = req.body;
  const userId = req.user.id;

  try {
    // Validate input
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Ensure compatibility with updated User model
    user.createdIdeas = user.createdIdeas || [];
    user.collaborations = user.collaborations || [];

    const idea = new Idea({
      title,
      description,
      tags: tags || [],
      creator: userId,
      collaborators: [userId], // Creator is a collaborator by default
    });

    await idea.save();
    user.createdIdeas.push(idea._id);
    await user.save();

    const populatedIdea = await Idea.findById(idea._id)
      .populate("creator", "name email") // Updated to match User model fields
      .populate("collaborators", "name"); // Updated to match User model fields

    getIO().emit("newIdea", populatedIdea); // Emit new idea event

    res.status(201).json({ success: true, data: populatedIdea });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateIdea = async (req, res) => {
  const { title, description, tags, status } = req.body;
  const userId = req.user.id;
  const ideaId = req.params.id;

  try {
    if (!mongoose.isValidObjectId(ideaId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid idea ID" });
    }

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });
    }

    // Only creator can update
    if (idea.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can update this idea",
      });
    }

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (tags) updates.tags = tags;
    if (status) updates.status = status;

    const updatedIdea = await Idea.findByIdAndUpdate(ideaId, updates, {
      new: true,
      runValidators: true,
    })
      .populate("creator", "name email") // Updated to match User model fields
      .populate("collaborators", "name"); // Updated to match User model fields

    if (!updatedIdea) {
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });
    }

    getIO().emit("updateIdea", updatedIdea); // Emit update event

    res.status(200).json({ success: true, data: updatedIdea });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteIdea = async (req, res) => {
  const userId = req.user.id;
  const ideaId = req.params.id;

  try {
    if (!mongoose.isValidObjectId(ideaId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid idea ID" });
    }

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });
    }

    // Only creator can delete
    if (idea.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can delete this idea",
      });
    }

    await Idea.findByIdAndDelete(ideaId);
    getIO().emit("deleteIdea", { ideaId }); // Emit delete event

    res
      .status(200)
      .json({ success: true, message: "Idea deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const joinIdea = async (req, res) => {
  const userId = req.user.id;
  const ideaId = req.params.id;

  try {
    if (!mongoose.isValidObjectId(ideaId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid idea ID" });
    }

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });
    }

    if (idea.status !== "open") {
      return res.status(400).json({
        success: false,
        message: `Cannot join an idea in ${idea.status} status`,
      });
    }

    if (idea.collaborators.includes(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Already a collaborator" });
    }

    idea.collaborators.push(userId);
    await idea.save();

    const user = await User.findById(userId);
    user.collaborations.push(ideaId);
    await user.save();

    const populatedIdea = await Idea.findById(ideaId)
      .populate("creator", "name email") // Updated to match User model fields
      .populate("collaborators", "name"); // Updated to match User model fields

    getIO().emit("collaborationUpdate", populatedIdea); // Emit collaboration update

    res.status(200).json({ success: true, data: populatedIdea });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const leaveIdea = async (req, res) => {
  const userId = req.user.id;
  const ideaId = req.params.id;

  try {
    if (!mongoose.isValidObjectId(ideaId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid idea ID" });
    }

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });
    }

    if (!idea.collaborators.includes(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Not a collaborator" });
    }

    if (idea.creator.toString() === userId) {
      return res
        .status(400)
        .json({ success: false, message: "Creator cannot leave the idea" });
    }

    idea.collaborators = idea.collaborators.filter(
      (collaborator) => collaborator.toString() !== userId
    );
    await idea.save();

    const user = await User.findById(userId);
    user.collaborations = user.collaborations.filter(
      (collab) => collab.toString() !== ideaId
    );
    await user.save();

    const populatedIdea = await Idea.findById(ideaId)
      .populate("creator", "name email") // Updated to match User model fields
      .populate("collaborators", "name"); // Updated to match User model fields

    getIO().emit("collaborationUpdate", populatedIdea); // Emit collaboration update

    res.status(200).json({ success: true, data: populatedIdea });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const upvoteIdea = async (req, res) => {
  const userId = req.user.id;
  const ideaId = req.params.id;

  try {
    if (!mongoose.isValidObjectId(ideaId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid idea ID" });
    }

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });
    }

    if (idea.upvotes.includes(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Already upvoted" });
    }

    idea.upvotes.push(userId);
    await idea.save();

    const populatedIdea = await Idea.findById(ideaId)
      .populate("creator", "name email") // Updated to match User model fields
      .populate("collaborators", "name"); // Updated to match User model fields

    getIO().emit("upvoteUpdate", populatedIdea); // Emit upvote update

    res.status(200).json({ success: true, data: populatedIdea });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const downvoteIdea = async (req, res) => {
  const userId = req.user.id;
  const ideaId = req.params.id;

  try {
    if (!mongoose.isValidObjectId(ideaId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid idea ID" });
    }

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });
    }

    if (!idea.upvotes.includes(userId)) {
      return res.status(400).json({ success: false, message: "Not upvoted" });
    }

    idea.upvotes = idea.upvotes.filter(
      (upvote) => upvote.toString() !== userId
    );
    await idea.save();

    const populatedIdea = await Idea.findById(ideaId)
      .populate("creator", "name email") // Updated to match User model fields
      .populate("collaborators", "name"); // Updated to match User model fields

    getIO().emit("upvoteUpdate", populatedIdea); // Emit upvote update

    res.status(200).json({ success: true, data: populatedIdea });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getAllIdeas,
  getIdeaById,
  createIdea,
  updateIdea,
  deleteIdea,
  joinIdea,
  leaveIdea,
  upvoteIdea,
  downvoteIdea,
};
