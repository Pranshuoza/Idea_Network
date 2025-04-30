import express from "express";
import { approveCollaboration, getCollaborationsForIdea, rejectCollaboration, requestCollaboration, withdrawCollaboration } from "../controllers/collaborationController.js";

const collaborationRouter = express.Router();

collaborationRouter.get(
  "/idea/:ideaId",
  getCollaborationsForIdea
);
collaborationRouter.post(
  "/request",
  requestCollaboration
);
collaborationRouter.patch(
  "/approve/:collaborationId",
  approveCollaboration
);
collaborationRouter.patch(
  "/reject/:collaborationId",
  rejectCollaboration
);
collaborationRouter.patch(
    "/withdraw/:collaborationId",
    withdrawCollaboration
);

export default collaborationRouter;
