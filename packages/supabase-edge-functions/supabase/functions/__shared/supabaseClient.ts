import { createClient } from "npm:@supabase/supabase-js";
import { Database } from "./types/supabase.ts";
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
export const supabaseClient = createClient<Database>(supabaseUrl,supabaseKey);