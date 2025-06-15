import express from "express";
import {
    createStartup,
    inviteCollaborator,
    createIdeaFromStartup,
    addTask,
    updateFunding,
    getStartupAnalytics,
} from "../controllers/startupController.js";
const startupRouter = express.Router();

startupRouter.post("/create", createStartup);
startupRouter.post("/invite", inviteCollaborator);
startupRouter.post("/create-idea", createIdeaFromStartup);
startupRouter.post("/add-task", addTask);
startupRouter.post("/update-funding", updateFunding);
startupRouter.get("/analytics", getStartupAnalytics);

export default startupRouter;
