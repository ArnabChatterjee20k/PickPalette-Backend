import { Database } from "../__shared/types/supabase.ts";
import verify from "../__shared/middlewares/verify.ts";
// @deno-types="npm:@types/express"
import express from "npm:express";
import cors from "npm:cors-express";
import verifyProjectDetails from "../__shared/middlewares/verifyProjectDetails.ts";
import verifyProjectOwner from "../__shared/middlewares/verifyProjectOwner.ts";
import { PaletteHandler } from "../__shared/services/PaletteHandler.ts";

const app = express();
app.use(cors());
app.use(express.json());
const palette = new PaletteHandler();
const ROUTE = "/palette_handler"; // name of the function
type IPalette = Database["public"]["Tables"]["palette"]["Row"];

app.get(`${ROUTE}/:project_id`, async (req, res) => {
  const projectId = parseInt(req.params.project_id);
  const { code, status, data } = await palette.get(projectId);
  return res.status(code).json({ data, status });
});

app.post(
  `${ROUTE}/:project_id`,
  verify,
  verifyProjectOwner,
  async (req, res) => {
    const projectId = parseInt(req.params.project_id);
    const { code, status, data } = await palette.create(projectId);
    return res.status(code).json({ data, status });
  }
);

app.put(
  `${ROUTE}/:project_id`,
  verify,
  verifyProjectOwner,
  async (req, res) => {
    const projectId = parseInt(req.params.project_id);
    const { colors }: IPalette = req.body;
    const { code, status, data } = await palette.update(
      projectId,
      colors as string[]
    );
    return res.status(code).json({ data, status });
  }
);
app.listen(8000);
