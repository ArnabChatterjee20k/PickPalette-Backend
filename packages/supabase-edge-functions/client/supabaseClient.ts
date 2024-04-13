import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv' 
dotenv.config()
const supabaseUrl = process.env.supabaseUrl as string
const supabaseKey = process.env.supabaseKey as string
export const supabase = createClient(supabaseUrl, supabaseKey)