import Collaboration from "../models/Collaboration.js";
import Idea from "../models/Idea.js";

const getCollaborationsForIdea = async (req, res) => {
  const { ideaId } = req.params;

  try {
    const collaborations = await Collaboration.find({ idea: ideaId }).populate("user", "firstName lastName email");
    res.json(collaborations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestCollaboration = async (req, res) => {
  const { ideaId, role, contribution } = req.body;
  const userId = req.user.id;

  try {
    const idea = await Idea.findById(ideaId);
    if (!idea) return res.status(404).json({ message: "Idea not found" });

    const existingRequest = await Collaboration.findOne({ idea: ideaId, user: userId });
    if (existingRequest) return res.status(400).json({ message: "Request already sent" });

    const collaboration = new Collaboration({
      idea: ideaId,
      user: userId,
      role,
      contribution,
    });

    await collaboration.save();
    res.status(201).json(collaboration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveCollaboration = async (req, res) => {
  const { collaborationId } = req.params;

  try {
    const collaboration = await Collaboration.findByIdAndUpdate(
      collaborationId,
      { status: "accepted" },
      { new: true }
    );

    if (!collaboration) return res.status(404).json({ message: "Collaboration not found" });

    res.json(collaboration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectCollaboration = async (req, res) => {
  const { collaborationId } = req.params;

  try {
    const collaboration = await Collaboration.findByIdAndUpdate(
      collaborationId,
      { status: "rejected" },
      { new: true }
    );

    if (!collaboration) return res.status(404).json({ message: "Collaboration not found" });

    res.json(collaboration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { requestCollaboration, approveCollaboration, rejectCollaboration, getCollaborationsForIdea };