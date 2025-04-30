import express from "express";
import {
  createIdea,
  deleteIdea,
  getAllIdeas,
  getIdeaById,
  joinIdea,
  leaveIdea,
  updateIdea,
  upvoteIdea,
  downvoteIdea,
} from "../controllers/ideaController.js";

const ideaRouter = express.Router();

ideaRouter.get("/", getAllIdeas);
ideaRouter.get("/:id", getIdeaById);
ideaRouter.post("/create", createIdea);
ideaRouter.put("/:id", updateIdea);
ideaRouter.delete("/:id", deleteIdea);
ideaRouter.post("/join/:id", joinIdea);
ideaRouter.post("/leave/:id", leaveIdea);
ideaRouter.post("/upvote/:id", upvoteIdea);
ideaRouter.post("/downvote/:id", downvoteIdea);

export default ideaRouter;
