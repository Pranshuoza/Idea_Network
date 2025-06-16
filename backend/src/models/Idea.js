import mongoose from "mongoose";

const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title must be less than or equal to 100 characters"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description must be less than or equal to 2000 characters"],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) =>
          tags.every((tag) => tag.length > 0 && tag.length <= 30),
        message: "Each tag must be between 1 and 30 characters",
      },
      set: (tags) => [...new Set(tags.map((tag) => tag.toLowerCase().trim()))],
    },
    status: {
      type: String,
      enum: ["draft", "open", "in-progress", "completed"],
      default: "open",
      index: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    contributions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contribution",
      },
    ],
  },
  { timestamps: true }
);

// Prevent invalid status transitions (e.g., completed -> draft)
ideaSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const validTransitions = {
      draft: ["open"],
      open: ["in-progress"],
      "in-progress": ["completed"],
      completed: [], // No transitions from completed
    };
    const currentStatus = this.status;
    const previousStatus = this.get("status", null, { getters: false });
    if (
      previousStatus &&
      !validTransitions[previousStatus].includes(currentStatus)
    ) {
      return next(new Error(`Invalid status transition from ${previousStatus} to ${currentStatus}`));
    }
  }
  next();
});

const Idea = mongoose.model("Idea", ideaSchema);

export default Idea;
