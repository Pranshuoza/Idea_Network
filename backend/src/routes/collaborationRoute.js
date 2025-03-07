import express from 'express';
import { approveCollaboration,rejectCollaboration, getCollaborationsForIdea, requestCollaboration } from "../controllers/collaborationController.js";

const collaborationRouter = express.Router();

collaborationRouter.post('/', getCollaborationsForIdea);
collaborationRouter.post('/request', requestCollaboration);
collaborationRouter.post('/approve/:collaborationId', approveCollaboration);
collaborationRouter.post('/reject/:collaborationId', rejectCollaboration);

export default collaborationRouter;