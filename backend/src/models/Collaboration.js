import mongoose from "mongoose";

const collaborationSchema = new mongoose.Schema({
  idea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Idea",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["contributor", "advisor", "investor"],
    default: "contributor",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  contribution: {
    type: String,
    maxlength: 500,
  },
}, { timestamps: true });

const Collaboration = mongoose.model("Collaboration", collaborationSchema);

export default Collaboration;
