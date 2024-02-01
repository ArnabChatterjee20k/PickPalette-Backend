import HTTPResponse from "../constants/HTTPResponse.ts";
import { supabaseClient } from "../supabaseClient.ts";
import { Database } from "../types/supabase.ts";
type PaletteTable = Database["public"]["Tables"]["palette"];
import DefaultColors from "../constants/DefaultColors.ts";
export class PaletteHandler {
  private async create(projectId: number) {
    const { status, error } = await supabaseClient
      .from("palette")
      .insert({ colors: DefaultColors, project_id: projectId });
    if (status === 201) return HTTPResponse("SUCCESS", status);
    return HTTPResponse("ERROR", status);
  }
  public async get(project_id: PaletteTable["Row"]["project_id"]) {
    const { data, status, error } = await supabaseClient
      .from("palette")
      .select("colors")
      .eq("project_id", project_id);
    if (error) return HTTPResponse("ERROR", status);
    if (!data || data.length === 0) {
      const { code, status, data } = await this.create(project_id);
      console.log({data})
      return HTTPResponse("SUCCESS", code, data);
    }
    return HTTPResponse("SUCCESS", status, data);
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
}
