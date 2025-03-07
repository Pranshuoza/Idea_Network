import mongoose, { model } from "mongoose";

const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title should be less than or equal to 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [
        2000,
        "Description should be less than or equal to 2000 characters",
      ],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "open", "in-progress", "completed"],
      default: "open",
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collaboration",
      },
    ],
  },
  { timestamps: true }
);

const Idea = model("Idea", ideaSchema);

export default Idea;