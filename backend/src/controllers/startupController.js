import Startup from "../models/Startup.js";
import Idea from "../models/Idea.js";
import Collaboration from "../models/Collaboration.js";
import User from "../models/User.js";
import { getIO } from "../config/socket.js";

const createStartup = async (req, res) => {
  const { name, description, ideaId, collaborationId } = req.body;

  try {
    if (!name || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Name and description are required" });
    }

    if (description.length < 100) {
      return res.status(400).json({
        success: false,
        message: "Description must be at least 100 characters",
      });
    }

    // Verify idea or collaboration if provided
    if (ideaId) {
      const idea = await Idea.findById(ideaId);
      if (!idea || idea.creator.toString() !== req.user._id.toString()) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or unauthorized idea" });
      }
    }

    if (collaborationId) {
      const collaboration = await Collaboration.findById(collaborationId);
      if (
        !collaboration ||
        collaboration.user.toString() !== req.user._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid or unauthorized collaboration",
        });
      }
    }

    // Check startup creation limit (e.g., 1 per week)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentStartups = await Startup.countDocuments({
      creator: req.user._id,
      createdAt: { $gte: oneWeekAgo },
    });
    if (recentStartups >= 1) {
      return res.status(429).json({
        success: false,
        message: "You can only create one startup per week",
      });
    }

    const startup = new Startup({
      name,
      description,
      idea: ideaId || null,
      collaboration: collaborationId || null,
      creator: req.user._id,
      team: [{ user: req.user._id, role: "founder", equity: 100 }],
    });

    await startup.save();

    getIO().emit("newStartup", {
      startupId: startup._id,
      name: startup.name,
      creator: req.user._id,
    });

    res.status(201).json({ success: true, data: startup });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const inviteCollaborator = async (req, res) => {
  const { startupId, userId, role, equity } = req.body;

  try {
    const startup = await Startup.findById(startupId);
    if (!startup) {
      return res
        .status(404)
        .json({ success: false, message: "Startup not found" });
    }

    if (startup.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can invite collaborators",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if user is already in the team
    if (startup.team.some((member) => member.user.toString() === userId)) {
      return res
        .status(400)
        .json({ success: false, message: "User is already a team member" });
    }

    // Validate equity
    const totalEquity = startup.team.reduce(
      (sum, member) => sum + member.equity,
      0
    );
    if (
      totalEquity -
        startup.team.find((m) => m.user.toString() === req.user._id).equity +
        (equity || 0) >
      100
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Total equity cannot exceed 100%" });
    }

    startup.team.push({
      user: userId,
      role: role || "collaborator",
      equity: equity || 0,
    });

    await startup.save();

    getIO().emit("collaboratorInvited", {
      startupId,
      userId,
      name: startup.name,
    });

    res.status(200).json({ success: true, data: startup.team });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createIdeaFromStartup = async (req, res) => {
  const { startupId, title, description, tags, status } = req.body;

  try {
    const startup = await Startup.findById(startupId);
    if (!startup) {
      return res
        .status(404)
        .json({ success: false, message: "Startup not found" });
    }

    if (startup.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can create an idea",
      });
    }

    if (startup.idea) {
      return res
        .status(400)
        .json({ success: false, message: "Startup already linked to an idea" });
    }

    const idea = new Idea({
      title,
      description,
      tags: tags || [],
      status: status || "open",
      creator: req.user._id,
    });

    await idea.save();

    startup.idea = idea._id;
    await startup.save();

    getIO().emit("newIdea", {
      ideaId: idea._id,
      startupId,
      title,
    });

    res.status(201).json({ success: true, data: idea });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const addTask = async (req, res) => {
  const { startupId, title, assignee, dueDate } = req.body;

  try {
    const startup = await Startup.findById(startupId);
    if (!startup) {
      return res
        .status(404)
        .json({ success: false, message: "Startup not found" });
    }

    if (startup.creator.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Only the creator can add tasks" });
    }

    const task = {
      title,
      assignee,
      dueDate: dueDate ? new Date(dueDate) : null,
    };
    startup.tasks.push(task);
    await startup.save();

    getIO().emit("newTask", { startupId, task });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateFunding = async (req, res) => {
  const { startupId, goal, raised } = req.body;

  try {
    const startup = await Startup.findById(startupId);
    if (!startup) {
      return res
        .status(404)
        .json({ success: false, message: "Startup not found" });
    }

    if (startup.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can update funding",
      });
    }

    startup.funding.goal = goal ?? startup.funding.goal;
    startup.funding.raised = raised ?? startup.funding.raised;
    await startup.save();

    getIO().emit("fundingUpdated", { startupId, funding: startup.funding });

    res.status(200).json({ success: true, data: startup.funding });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getStartupAnalytics = async (req, res) => {
  const { startupId } = req.params;

  try {
    const startup = await Startup.findById(startupId).populate(
      "idea collaboration"
    );
    if (!startup) {
      return res
        .status(404)
        .json({ success: false, message: "Startup not found" });
    }

    // Calculate analytics
    let analytics = {
      upvotes: 0,
      activeCollaborators: startup.team.length,
      contributions: 0,
      tasksCompleted: startup.tasks.filter((t) => t.status === "completed")
        .length,
      totalTasks: startup.tasks.length,
      fundingProgress: startup.funding.goal
        ? (startup.funding.raised / startup.funding.goal) * 100
        : 0,
    };

    if (startup.idea) {
      const idea = await Idea.findById(startup.idea);
      const collaborations = await Collaboration.find({
        idea: startup.idea,
        status: "accepted",
      });
      const contributions = await Collaboration.find({ idea: startup.idea });

      analytics = {
        ...analytics,
        upvotes: idea ? idea.upvotes.length : 0,
        activeCollaborators: collaborations.length,
        contributions: contributions.length,
      };
    }

    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  createStartup,
  inviteCollaborator,
  createIdeaFromStartup,
  addTask,
  updateFunding,
  getStartupAnalytics,
};
