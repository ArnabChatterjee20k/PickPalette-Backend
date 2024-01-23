import {supabase} from "./client/supabaseClient.js"

supabase.functions.invoke("feedback-with-sentiment",{body:{feedback:"This is just great", userId:"e660ac28-f060-4580-ad38-552495f847a8"}}).then(console.log)