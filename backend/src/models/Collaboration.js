import mongoose from "mongoose";

const collaborationSchema = new mongoose.Schema(
  {
    idea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idea",
      required: true,
      index: true, // Optimize queries by idea
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Optimize queries by user
    },
    role: {
      type: String,
      enum: ["contributor", "advisor", "investor", "developer", "designer"],
      default: "contributor",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
      index: true, // Optimize filtering by status
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message must be less than or equal to 500 characters"],
      default: "", // Optional message for collaboration request
    },
  },
  { timestamps: true }
);

// Unique index to prevent duplicate requests
collaborationSchema.index({ idea: 1, user: 1 }, { unique: true });

// Validate status transitions
collaborationSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const validTransitions = {
      pending: ["accepted", "rejected", "withdrawn"],
      accepted: [],
      rejected: [],
      withdrawn: [],
    };
    const currentStatus = this.status;
    const previousStatus = this.get("status", null, { getters: false });
    if (
      previousStatus &&
      !validTransitions[previousStatus].includes(currentStatus)
    ) {
      return next(
        new Error(
          `Invalid status transition from ${previousStatus} to ${currentStatus}`
        )
      );
    }
  }
  next();
});

const Collaboration = mongoose.model("Collaboration", collaborationSchema);

export default Collaboration;