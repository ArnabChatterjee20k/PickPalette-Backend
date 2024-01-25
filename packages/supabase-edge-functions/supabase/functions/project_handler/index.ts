import { Database } from "../__shared/types/supabase.ts";
import verify from "../__shared/middlewares/verify.ts";
import ProjectHandler from "../__shared/services/ProjectHandler.ts";
// @deno-types="npm:@types/express"
import express from "npm:express";
import cors from "npm:cors-express";
import verifyProjectDetails from "../__shared/middlewares/verifyProjectDetails.ts";
import verifyAPIKey from "../__shared/middlewares/verifyAPIKey.ts";

const app = express();
app.use(cors());
app.use(express.json());
const project = new ProjectHandler();
const ROUTE = "/project_handler"; // name of the function
type IProject = Database["public"]["Tables"]["project"]["Row"];
app.get(`${ROUTE}/:user_id`, verify, async (req, res) => {
  const user_id = req.params.user_id;
  const data = await project.get(user_id);
  return res.status(data.code).json(data);
});

app.post(
  `${ROUTE}/:project_id`,
  verify,
  verifyProjectDetails,
  async (req, res) => {
    const { name, description, user_id }: IProject = req.body;
    const { code, status } = await project.create({
      user_id,
      name,
      description,
    });
    return res.status(code).json(status);
  }
);

app.put(`${ROUTE}/:project_id`, verify, verifyAPIKey, async (req, res) => {
  const project_id = req.params.project_id;
  const { name, description, user_id }: IProject = req.body;
  const { code, status } = await project.update({
    name,
    description,
    user_id,
    id: project_id,
  });
  return res.status(code).json({ code, status });
});

app.delete(`${ROUTE}/:project_id`, verify, verifyAPIKey, async (req, res) => {
  const project_id = req.params.project_id as string;
  const { name }: IProject = req.body;
  const { code, status } = await project.delete(parseInt(project_id));
  return res.status(code).json({ code, status });
});

app.listen(8000);
