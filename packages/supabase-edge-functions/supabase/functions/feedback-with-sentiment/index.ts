// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// @ts-ignore
import {
  env,
  pipeline,
} from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.5.0";

// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configuration for Deno runtime
env.useBrowserCache = false;
env.allowLocalModels = false;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { feedback, userId } = await req.json();

    const response = await addFeedbackToDb(feedback, userId);
    console.log({response})
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

export async function addFeedbackToDb(feedback, userId) {
  const pipe = await pipeline("sentiment-analysis","Xenova/distilbert-base-uncased-finetuned-sst-2-english");
  const [output] = await pipe(feedback, {
    pooling: "mean",
    normalize: true,
  });
  const { score } = output;

  const supabase = getSupabaseClient();
  const { statusText,error } = await supabase.from("feedback").insert({
    user_id: userId,
    sentiment_score: score,
    feedback: feedback,
  });
  if(error) return error
  return statusText
}

function getSupabaseClient() {
  const supabaseClient = createClient(
    "https://whgsfajxsfkedwplrtkf.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZ3NmYWp4c2ZrZWR3cGxydGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM1MjU3NDQsImV4cCI6MjAxOTEwMTc0NH0.NLzUW7kO0PJZbXBHb9lAqxB0_jHos--_bf6VWSBKdb4"
  );
  return supabaseClient;
}

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
