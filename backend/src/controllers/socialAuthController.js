import jwt from "jsonwebtoken";
import User from "../models/User.js";

const handleGoogleCallback = async (req, res) => {
  try {
    const token = jwt.sign(
      { name: req.user.name, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    // Save the token to the user's recentToken
    const user = await User.findOne({ email: req.user.email });
    if (user) {
      user.recentToken = token;
      await user.save();
    }

    res.redirect(`http://localhost:5173/profile?token=${token}`);
  } catch (error) {
    console.error("Error in Google callback:", error);
    res.redirect("http://localhost:5173/login?error=google_auth_failed");
  }
};

export { handleGoogleCallback };