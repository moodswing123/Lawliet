import OpenAI, { type ChatCompletionMessageParam } from "openai"
import type { ChatMessage } from "@/lib/chat-types"

const GROQ_BASE_URL = "https://api.groq.com/openai/v1"

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured")
  }
  return new OpenAI({ apiKey, baseURL: GROQ_BASE_URL })
}

function getGroqModel() {
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
}

function getTextAttachment(attachment: NonNullable<ChatMessage["attachments"]>[number]) {
  if (!attachment.type.startsWith("text/")) return `[Attached file: ${attachment.name}]`
  const base64 = attachment.dataUrl.split(",")[1] || ""
  try {
    const text = Buffer.from(base64, "base64").toString("utf8")
    return `[Attached file: ${attachment.name}]\n${text.slice(0, 12000)}`
  } catch {
    return `[Attached file: ${attachment.name}]`
  }
}

export async function transcribeAudio(dataUrl: string, mimeType: string) {
  const base64 = dataUrl.split(",")[1] || ""
  if (!base64) throw new Error("Audio data is missing")
  const extension = mimeType.split("/")[1]?.split(";")[0] || "m4a"
  const file = new File([Buffer.from(base64, "base64")], `recording.${extension}`, { type: mimeType })
  try {
    const response = await getGroqClient().audio.transcriptions.create({
      file,
      model: process.env.GROQ_TRANSCRIPTION_MODEL || "whisper-large-v3-turbo",
      temperature: 0,
      response_format: "text",
      prompt: "Return only the spoken words, without commentary.",
    })
    return String(response).trim()
  } catch (error: any) {
    const status = error?.status || error?.response?.status
    if (status === 401 || status === 403) throw new Error("Invalid Groq API key. Please check GROQ_API_KEY.")
    if (status === 429) throw new Error("Groq rate limit exceeded. Please try again later.")
    throw new Error(`Groq transcription error: ${error?.message || "Unknown error"}`)
  }
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  model?: string,
  temperature?: number,
  maxTokens?: number
): Promise<AsyncIterable<string>> {
  const defaultModel = getGroqModel()
  const modelToUse = model === defaultModel ? model : defaultModel
  const temp = temperature ?? parseFloat(process.env.GROQ_TEMPERATURE || "0.7")
  const tokens = maxTokens ?? parseInt(process.env.GROQ_MAX_TOKENS || "4096", 10)
  const formattedMessages = messages.map((message) => {
    const attachments = message.attachments || []
    const text = [message.content, ...attachments.filter((attachment) => !attachment.type.startsWith("image/")).map(getTextAttachment)]
      .filter(Boolean)
      .join("\n\n")
    const imageParts = attachments
      .filter((attachment) => attachment.type.startsWith("image/"))
      .map((attachment) => ({ type: "image_url" as const, image_url: { url: attachment.dataUrl } }))
    return imageParts.length
      ? { role: message.role, content: [{ type: "text" as const, text }, ...imageParts] }
      : { role: message.role, content: text }
  })

  try {
    const stream = await getGroqClient().chat.completions.create({
      model: modelToUse,
      messages: formattedMessages as unknown as ChatCompletionMessageParam[],
      temperature: temp,
      max_tokens: tokens,
      stream: true,
    })

    const textChunks = async function* () {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || ""
        if (text) yield text
      }
    }

    return textChunks()
  } catch (error: any) {
    const status = error?.status || error?.response?.status
    const message = error?.message || "Unknown error"
    if (status === 401 || status === 403) throw new Error("Invalid Groq API key. Please check GROQ_API_KEY.")
    if (status === 429) throw new Error("Groq rate limit exceeded. Please try again later.")
    if (status === 404) throw new Error(`Groq model \"${modelToUse}\" was not found.`)
    throw new Error(`Groq error: ${message}`)
  }
}
