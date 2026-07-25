import { createClient } from "@supabase/supabase-js"

export const supabaseStorage = createClient(
  process.env.SUPABASE_URL?.trim() || "https://dummy.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "dummy_key_for_build"
)

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "trustflow-evidence"
