import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function streamChatCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  model?: string,
  temperature?: number,
  maxTokens?: number
) {
  const modelToUse = model || process.env.OPENAI_MODEL || "gpt-4-turbo-preview"
  const temp = temperature || parseFloat(process.env.OPENAI_TEMPERATURE || "0.7")
  const tokens = maxTokens || parseInt(process.env.OPENAI_MAX_TOKENS || "4096")

  try {
    const stream = await openai.chat.completions.create({
      model: modelToUse,
      messages,
      temperature: temp,
      max_tokens: tokens,
      stream: true,
    })

    return stream
  } catch (error: any) {
    if (error.status === 401) {
      throw new Error("Invalid API key. Please check your OpenAI credentials.")
    }
    if (error.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.")
    }
    if (error.status === 404) {
      throw new Error(
        `Model "${modelToUse}" not found. Check your OPENAI_MODEL setting.`
      )
    }
    throw new Error(`OpenAI error: ${error.message || "Unknown error"}`)
  }
}