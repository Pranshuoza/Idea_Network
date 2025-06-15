import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import Idea from "../models/Idea.js";
import Collaboration from "../models/Collaboration.js";

const signup = async (req, res) => {
  const { name, email, password, address } = req.body;

  try {
    if (!name || !email || !password || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should be at least 6 characters long" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword, // Save hashed password
      address,
    });

    await newUser.save();
    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      address: newUser.address,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    ); // Ensure email is case-insensitive
    if (!user) {
      return res.status(400).json({ message: "Invalid email" }); // Email not found
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" }); // Password mismatch
    }

    const token = generateToken(user._id, res);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
      token,
    });
  } catch (error) {
    console.error("Error during login:", error.message); // Log the error for debugging
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const hasIdea = await Idea.findOne({ creator: req.user._id });
    const hasCollaboration = await Collaboration.findOne({
      user: req.user._id,
    });
    const canStartUp = hasIdea || hasCollaboration;

    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      address: req.user.address,
      canStartUp,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { signup, login, logout, getCurrentUser };
