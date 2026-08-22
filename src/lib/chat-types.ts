export type ChatAttachment = {
  name: string
  type: string
  size: number
  dataUrl: string
}

export type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
  attachments?: ChatAttachment[]
}
