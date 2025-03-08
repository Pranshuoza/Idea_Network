import Idea from "../models/ideaModel.js";
import User from "../models/User.js";

const getAllIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find()
      .populate("creator", "firstName lastName email")
      .populate("collaborators", "firstName lastName");
    res.status(200).json(ideas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getIdeaById = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id)
      .populate("creator", "firstName lastName email")
      .populate("collaborators", "firstName lastName");

    if (!idea) return res.status(404).json({ message: "Idea not found" });

    res.status(200).json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createIdea = async (req, res) => {
  const { title, description, tags } = req.body;
  const userId = req.user.id;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    const idea = new Idea({
      title,
      description,
      tags,
      creator: userId,
    });
    await idea.save();
    res.status(201).json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateIdea = async (req, res) => {
  const { title, description, tags } = req.body;
  const userId = req.user.id;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const idea = await Idea.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        tags,
      },
      { new: true }
    );
    if (!idea) return res.status(404).json({ message: "Idea not found" });
    res.status(200).json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteIdea = async (req, res) => { 
    try {
        const idea = await Idea.findByIdAndDelete(req.params.id);
        if (!idea) return res.status(404).json({ message: "Idea not found" });
        res.status(200).json({ message: "Idea deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const joinIdea = async (req, res) => {
    const userId = req.user.id;
    const ideaId = req.params.id;
    try {
        const idea = await Idea.findById(ideaId);
        if (!idea) return res.status(404).json({ message: "Idea not found" });

        const existingCollaborator = idea.collaborators.find(
            (collaborator) => collaborator.toString() === userId
        );

        if (existingCollaborator) return res.status(400).json({ message: "Already a collaborator" });

        idea.collaborators.push(userId);
        await idea.save();
        res.status(200).json(idea);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const leaveIdea = async (req, res) => {
    const userId = req.user.id;
    const ideaId = req.params.id;
    try {
        const idea = await Idea.findById(ideaId);
        if (!idea) return res.status(404).json({ message: "Idea not found" });

        const existingCollaborator = idea.collaborators.find(
            (collaborator) => collaborator.toString() === userId
        );

        if (!existingCollaborator) return res.status(400).json({ message: "Not a collaborator" });

        idea.collaborators = idea.collaborators.filter(
            (collaborator) => collaborator.toString() !== userId
        );

        await idea.save();
        res.status(200).json(idea);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export { getAllIdeas, getIdeaById, createIdea ,updateIdea, deleteIdea ,joinIdea ,leaveIdea};
