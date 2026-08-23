import { GoogleGenAI } from "@google/genai"
import type { ChatMessage } from "@/lib/chat-types"

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured")
  }
  return new GoogleGenAI({ apiKey })
}

export async function transcribeAudio(dataUrl: string, mimeType: string) {
  const response = await getGeminiClient().models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
    contents: [{
      role: "user",
      parts: [
        { text: "Transcribe the attached audio exactly. Return only the spoken words, without commentary." },
        { inlineData: { mimeType, data: dataUrl.split(",")[1] || "" } },
      ],
    }],
    config: { temperature: 0, maxOutputTokens: 2048 },
  })
  return response.text?.trim() || ""
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  model?: string,
  temperature?: number,
  maxTokens?: number
): Promise<AsyncIterable<string>> {
  const defaultGeminiModel = process.env.GEMINI_MODEL || "gemini-3.6-flash"
  const modelToUse = model === defaultGeminiModel ? model : defaultGeminiModel
  const temp = temperature ?? parseFloat(process.env.GEMINI_TEMPERATURE || "0.7")
  const tokens = maxTokens ?? parseInt(process.env.GEMINI_MAX_TOKENS || "4096", 10)
  const systemMessages = messages.filter((message) => message.role === "system")
  const contents = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [
        { text: message.content },
        ...(message.attachments || []).map((attachment) => ({
          inlineData: {
            mimeType: attachment.type || "application/octet-stream",
            data: attachment.dataUrl.split(",")[1] || "",
          },
        })),
      ],
    }))

  try {
    const stream = await getGeminiClient().models.generateContentStream({
      model: modelToUse,
      contents,
      config: {
        temperature: temp,
        maxOutputTokens: tokens,
        ...(systemMessages.length > 0
          ? { systemInstruction: systemMessages.map((message) => message.content).join("\n\n") }
          : {}),
      },
    })

    const textChunks = async function* () {
      for await (const chunk of stream) {
        const text = chunk.text || ""
        if (text) yield text
      }
    }

    return textChunks()
  } catch (error: any) {
    const status = error?.status || error?.response?.status
    const message = error?.message || "Unknown Gemini error"
    if (status === 401 || status === 403) {
      throw new Error("Invalid Gemini API key. Please check GEMINI_API_KEY.")
    }
    if (status === 429) {
      throw new Error("Gemini rate limit exceeded. Please try again later.")
    }
    if (status === 404) {
      throw new Error(`Gemini model \"${modelToUse}\" was not found.`)
    }
    throw new Error(`Gemini error: ${message}`)
  }
}
