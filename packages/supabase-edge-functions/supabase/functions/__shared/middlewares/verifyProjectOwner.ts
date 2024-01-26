// @deno-types="npm:@types/express"
import { Request, Response, NextFunction } from "npm:express";
import ProjectHandler from "../services/ProjectHandler.ts";
export default async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.currentUserId as string;
  const projectId = parseInt(req.params.project_id);
  const isOwner = await new ProjectHandler().verifyProjectOwner(
    projectId,
    userId
  );
  if (!isOwner) return res.sendStatus(401);
  next();
};
