import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minlength: [2, "First name must be at least 2 characters long"],
      maxlength: [20, "First name must be less than or equal to 20 characters"],
      trim: true,
      lowercase: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minlength: [2, "Last name must be at least 2 characters long"],
      maxlength: [20, "Last name must be less than or equal to 20 characters"],
      trim: true,
      lowercase: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
      unique: true,
      index: true, // Improve query performance
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
      index: true, // Improve query performance
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Prevent password from being returned in queries
    },
    address: {
      type: String,
      trim: true,
      maxlength: [100, "Address must be less than or equal to 100 characters"],
      default: "", // Optional field with default value
    },
    createdIdeas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Idea",
      },
    ],
    collaborations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Idea",
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving, but only if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;