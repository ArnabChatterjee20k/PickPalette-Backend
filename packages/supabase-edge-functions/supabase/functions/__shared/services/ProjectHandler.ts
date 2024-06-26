import HTTPResponse from "../constants/HTTPResponse.ts";
import { supabaseClient } from "../supabaseClient.ts";
import { Database } from "../types/supabase.ts";
import { PaletteHandler } from "./PaletteHandler.ts";

type ProjectTable = Database["public"]["Tables"]["project"];
type ICreate = Pick<ProjectTable["Row"], "user_id" | "name" | "description">;

export default class ProjectHandler {
  public async create({ user_id, name, description }: ICreate) {
    const { data, status, error } = await supabaseClient
      .from("project")
      .insert({ name, description, user_id })
      .select("id");
    if (error) return HTTPResponse("ERROR", status);
    return HTTPResponse("SUCCESS", status, data[0]);
  }

  public async get(user_id: string) {
    const { data, status } = await supabaseClient
      .from("project")
      .select("name,id")
      .eq("user_id", user_id)
      .select();

    if (status === 200) return HTTPResponse("SUCCESS", status, data);
    return HTTPResponse("ERROR", status, data);
  }

  public async getAllProjects(user_id: string) {
    const { data, status } = await supabaseClient
      .from("project")
      .select("id,name,description")
      .eq("user_id", user_id);

    if (status === 200) return HTTPResponse("SUCCESS", status, data);
    return HTTPResponse("ERROR", status, data);
  }
  public async update({
    name,
    description,
    user_id,
    id,
  }: ProjectTable["Update"]) {
    if (!user_id) return HTTPResponse("ERROR", 400);
    const fieldsToBeUpdated: ProjectTable["Update"] = {};
    if (name?.trim()) fieldsToBeUpdated.name = name;
    if (description?.trim()) fieldsToBeUpdated.description = description;

    if (Object.keys(fieldsToBeUpdated).length > 0) {
      const { status, error } = await supabaseClient
        .from("project")
        .update(fieldsToBeUpdated)
        .filter("user_id", "eq", user_id)
        .filter("id", "eq", id);
      if (status === 204) return HTTPResponse("SUCCESS", status);
      console.log({ error });
      if (error) return HTTPResponse("ERROR", status);
    }
    return HTTPResponse("SUCCESS", 204);
  }

  public async updateShare({ id, share }: ProjectTable["Update"]) {
    if (!share) return HTTPResponse("ERROR", 400);
    const { status, error } = await supabaseClient
      .from("project")
      .update({ share: share })
      .filter("id", "eq", id);
    if (error) return HTTPResponse("ERROR", 400);
    return HTTPResponse("SUCCESS", status);
  }

  public async delete(id: ProjectTable["Row"]["id"]) {
    const { status, error } = await supabaseClient
      .from("project")
      .delete()
      .eq("id", id);
    if (error) HTTPResponse("ERROR", status);
    if (status === 204) return HTTPResponse("SUCCESS", status);
    return HTTPResponse("ERROR", status);
  }

  public async verifyProjectOwner(
    id: ProjectTable["Row"]["id"],
    user_id: ProjectTable["Row"]["user_id"]
  ) {
    const { count, data } = await supabaseClient
      .from("project")
      .select("id", { count: "exact", head: true })
      .filter("id", "eq", id)
      .or(`user_id.eq.${user_id},share.eq.true`);
    return count === 1;
  }
}
