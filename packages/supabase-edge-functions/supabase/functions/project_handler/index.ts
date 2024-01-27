import { Database } from "../__shared/types/supabase.ts";
import verify from "../__shared/middlewares/verify.ts";
import ProjectHandler from "../__shared/services/ProjectHandler.ts";
// @deno-types="npm:@types/express"
import express from "npm:express";
import cors from "npm:cors-express";
import verifyProjectDetails from "../__shared/middlewares/verifyProjectDetails.ts";
import verifyProjectOwner from "../__shared/middlewares/verifyProjectOwner.ts";
import { validationResult } from "npm:express-validator";

const app = express();
app.use(cors());
app.use(express.json());
const project = new ProjectHandler();
const ROUTE = "/project_handler"; // name of the function
type IProject = Database["public"]["Tables"]["project"]["Row"];

app.get(`${ROUTE}`, verify, async (req, res) => {
  const user_id = req?.currentUserId as string;
  const data = await project.get(user_id);
  return res.status(data.code).json(data);
});

app.post(`${ROUTE}`, verify, verifyProjectDetails, async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) return res.status(400).json({ errors: error.array() });
  const { name, description }: IProject = req.body;
  const userId = req.currentUserId;
  const { code, status } = await project.create({
    user_id: userId,
    name,
    description,
  });
  return res.status(code).json({status,token:""});
});

app.put(`${ROUTE}/:project_id`, verify, verifyProjectOwner, async (req, res) => {
  const project_id = parseInt(req.params.project_id);
  const { name, description }: IProject = req.body;
  const userId = req.currentUserId
  const { code, status } = await project.update({
    name,
    description,
    id: project_id,
    user_id:userId
  });
  return res.status(code).json({ code, status });
});

app.delete(`${ROUTE}/:project_id`, verify, verifyProjectOwner, async (req, res) => {
  const project_id = req.params.project_id as string;
  const { name }: IProject = req.body;
  const { code, status } = await project.delete(parseInt(project_id));
  return res.status(code).json({ code, status });
});

app.listen(8000);