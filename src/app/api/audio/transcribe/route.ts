import { NextResponse } from "next/server"
import { getRequestUserId } from "@/lib/mobile-auth"
import { transcribeAudio } from "@/lib/openai"

const MAX_AUDIO_BYTES = 8 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const userId = await getRequestUserId(request)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : ""
    const mimeType = typeof body.mimeType === "string" ? body.mimeType : "audio/m4a"
    const base64 = dataUrl.split(",")[1] || ""
    const estimatedBytes = Math.floor((base64.length * 3) / 4)

    if (!dataUrl.startsWith("data:audio/") || !base64 || estimatedBytes <= 0 || estimatedBytes > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "Audio recording is invalid or too large." }, { status: 400 })
    }

    const transcript = await transcribeAudio(dataUrl, mimeType)
    return NextResponse.json({ transcript })
  } catch (error) {
    console.error("Audio transcription error:", error)
    return NextResponse.json({ error: "Unable to transcribe the recording." }, { status: 500 })
  }
}
