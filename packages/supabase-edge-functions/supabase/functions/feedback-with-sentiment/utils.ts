import Sentiment from "sentiment";
import { createClient } from "@supabase/supabase-js";

export async function addFeedbackToDb(feedback, userId) {
    const sentiment = new Sentiment({});
    // @ts-ignore
    const { score } = sentiment.analyze(feedback);
    
    const supabase = getSupabaseClient()
    const { statusText } = await supabase.from("feedback").insert({
      user_id: userId,
      sentiment_score: score,
      feedback: feedback,
    });
  
    return statusText;
  }

function getSupabaseClient(){
    const supabaseClient = createClient("https://whgsfajxsfkedwplrtkf.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZ3NmYWp4c2ZrZWR3cGxydGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM1MjU3NDQsImV4cCI6MjAxOTEwMTc0NH0.NLzUW7kO0PJZbXBHb9lAqxB0_jHos--_bf6VWSBKdb4");
    return supabaseClient
    
}