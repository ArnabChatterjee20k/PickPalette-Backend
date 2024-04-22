import { Database } from "../__shared/types/supabase.ts";
import verify from "../__shared/middlewares/verify.ts";
// @deno-types="npm:@types/express"
import express from "npm:express";
import cors from "npm:cors-express";
import { PaletteHandler } from "../__shared/services/PaletteHandler.ts";
import HTTPResponse from "../__shared/constants/HTTPResponse.ts";

const app = express();
app.use(cors());
app.use(express.json());
const palette = new PaletteHandler();
const ROUTE = "/saved_palettes"; // name of the function
const options = ["save", "unsave"];

app.get(`${ROUTE}`, verify, async (req, res) => {
  const user_id = req.currentUserId as string;
  const { data, status, code } = await palette.getSavedPalettes(user_id);
  res.status(code).json({ data, status });
});

app.put(`${ROUTE}`, verify, async (req, res) => {
  const query = req.query;
  const operation = query.q;
  const user_id = req.currentUserId as string;
  // @ts-ignore
  if (!options.includes(operation)) {
    return res
      .status(400)
      .json({ status: "ERROR", message: "q should be save or unsave" });
  }

  const { savedPalette }: { savedPalette: string[] } = req.body;
  if (savedPalette instanceof Array === false || savedPalette.length === 0) {
    return res
      .status(400)
      .json({
        status: "ERROR",
        message:
          "savedPalette should be an array in provided in the request body",
      });
  }
  const action =
    operation === "save"
      ? palette.savePalette(savedPalette, user_id)
      : palette.unSavePalette(savedPalette, user_id);
  const { code, status } = await action;
  return res.status(code).json({ status, message: `palette ${operation}d` });
});
app.listen(8000);
