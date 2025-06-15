import express from "express";
import { getCurrentUser, login, logout, signup } from "../controllers/authController.js";
import { protectRoute } from "../middleware/authProtect.js";
const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/getCurrent",protectRoute,getCurrentUser)

export default authRouter;
