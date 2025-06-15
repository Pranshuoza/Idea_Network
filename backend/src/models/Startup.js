import mongoose from "mongoose";

const startupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Startup name is required"],
      trim: true,
      maxlength: [100, "Startup name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    idea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idea",
      required: false,
    },
    collaboration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collaboration",
      required: false,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    team: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["founder", "collaborator", "advisor"],
          default: "collaborator",
        },
        equity: {
          type: Number,
          min: [0, "Equity cannot be negative"],
          max: [100, "Equity cannot exceed 100%"],
          default: 0,
        },
      },
    ],
    tasks: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        assignee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        dueDate: {
          type: Date,
        },
        status: {
          type: String,
          enum: ["pending", "in-progress", "completed"],
          default: "pending",
        },
      },
    ],
    funding: {
      goal: {
        type: Number,
        min: [0, "Funding goal cannot be negative"],
        default: 0,
      },
      raised: {
        type: Number,
        min: [0, "Raised amount cannot be negative"],
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ["planning", "active", "launched", "closed"],
      default: "planning",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Startup", startupSchema);