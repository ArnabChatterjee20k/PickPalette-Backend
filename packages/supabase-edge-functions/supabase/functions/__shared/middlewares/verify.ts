// @deno-types="npm:@types/express"
import { Request, Response, NextFunction } from "npm:express";
import { supabaseClient } from "../supabaseClient.ts";

export default async (req: Request, res: Response, next: NextFunction) => {
  const bearerHeader = req.get("Authorization");
  if (!bearerHeader)
    return res.status(403).json({ status: "Bearer token not found in header" });
  const bearer = bearerHeader?.split(" ") as string[];
  const bearerToken = bearer[1];
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser(bearerToken);
  if (error) return res.status(error.status!).json({ status: error.message });
  const userId = user?.id;
  req.currentUserId = userId;
  next();
};
