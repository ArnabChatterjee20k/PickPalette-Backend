import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv' 
dotenv.config()
const supabaseUrl = process.env.supabaseUrl
const supabaseKey = process.env.supabaseKey
export const supabase = createClient(supabaseUrl, supabaseKey)

export const tables = {
    newsletter:"newsletter",
    feedback:"feedback"
}