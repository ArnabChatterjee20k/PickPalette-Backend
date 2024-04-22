import HTTPResponse from "../constants/HTTPResponse.ts";
import { supabaseClient } from "../supabaseClient.ts";
import { Database } from "../types/supabase.ts";
import DefaultColors from "../constants/DefaultColors.ts";
import ProjectHandler from "./ProjectHandler.ts";

type PaletteTable = Database["public"]["Tables"]["palette"];
type SavedPalettes = Database["public"]["Tables"]["saved-palettes"];

export class PaletteHandler {
  private async create(projectId: number) {
    const { data, status, error } = await supabaseClient
      .from("palette")
      .insert({ colors: DefaultColors, project_id: projectId })
      .select("colors,project(name)");
    console.log({ error });
    if (error) return HTTPResponse("ERROR", status);
    const result = {
      name: data[0].project?.name,
      colors: data[0].colors,
    };
    return HTTPResponse("SUCCESS", status, [result]);
  }
  public async get(project_id: PaletteTable["Row"]["project_id"]) {
    const { data, status, error } = await supabaseClient
      .from("project")
      .select(
        `
      name,
      id,share,
      palette(colors)
      `
      )
      .eq("id", project_id);
    if (error) return HTTPResponse("ERROR", status);

    // If project exists but palette does not exists then create the palettes
    if (data[0]?.id && data[0].palette.length === 0) {
      const { code, status, data } = await this.create(project_id);
      console.log(data, status);
      return HTTPResponse("SUCCESS", code, data);
    }

    // if project does not exists return error
    if (!data || data.length === 0) return HTTPResponse("ERROR", 404);

    // if both palette exists send the palette
    const result = {
      name: data[0].name,
      id: data[0].id,
      colors: data[0].palette[0].colors,
    };
    return HTTPResponse("SUCCESS", status, [result]);
  }
  public async update(projectId: number, colors: string[]) {
    const { data, status, error } = await supabaseClient
      .from("palette")
      .update({ colors: colors })
      .eq("project_id", projectId)
      .select("colors");
    console.log({ status, error });
    if (error) return HTTPResponse("ERROR", status, data);
    return HTTPResponse("SUCCESS", status, data);
  }
  public async savePalette(palette: string[], user_id: string) {
    const paletteToString = palette.join("-");
    const { status, error } = await supabaseClient
      .from("saved-palettes")
      .upsert(
        { palette: paletteToString, user_id: user_id },
        {
          onConflict: "palette,user_id",
        }
      );
    if (error || ![201,200].includes(status) ) return HTTPResponse("ERROR", status);
    return HTTPResponse("SUCCESS", status);
  }
  public async unSavePalette(palette: string[], user_id: string) {
    const paletteToString = palette.join("-");
    const { error, status } = await supabaseClient
      .from("saved-palettes")
      .delete()
      .filter("palette", "eq", paletteToString)
      .filter("user_id", "eq", user_id);
    if (error || status !== 204) return HTTPResponse("ERROR", status);
    return HTTPResponse("SUCCESS", status);
  }

  public async getSavedPalettes(user_id: string) {
    const {data,error,status} = await supabaseClient
      .from("saved-palettes")
      .select("palette")
      .filter("user_id", "eq", user_id);
    if(error || status !== 200) return HTTPResponse("ERROR",status)
    return HTTPResponse("SUCCESS",status,data)
  }
}