import { NextRequest, NextResponse } from "next/server"
import { supabaseStorage, STORAGE_BUCKET } from "@/lib/supabase-storage"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = `${Date.now()}-${file.name}`

  const { data, error: uploadError } = await supabaseStorage.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, buffer, { contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabaseStorage.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName)

  return NextResponse.json({ url: urlData.publicUrl, path: data?.path })
}
