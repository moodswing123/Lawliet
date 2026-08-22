"use client"

import { MessageBubble } from "./MessageBubble"
import { ChatAttachment } from "@/lib/chat-types"

interface MessageListProps {
  messages: any[]
  onRegenerate: (messageId: string) => void
  onEdit: (messageId: string, newContent: string) => void
  isGenerating: boolean
  onFeedback: (messageId: string, feedback: "positive" | "negative") => void
}

export function MessageList({
  messages,
  onRegenerate,
  onEdit,
  isGenerating,
  onFeedback,
}: MessageListProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {messages.map((message, index) => {
        const isLast = index === messages.length - 1
        return (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            attachments={message.attachments as ChatAttachment[] | undefined}
            onFeedback={(feedback) => onFeedback(message.id, feedback)}
            onRegenerate={
              message.role === "assistant" && isLast && !isGenerating
                ? () => onRegenerate(message.id)
                : undefined
            }
            onEdit={
              message.role === "user" && !isGenerating
                ? () => {
                    const newContent = prompt("Edit your message:", message.content)
                    if (newContent) onEdit(message.id, newContent)
                  }
                : undefined
            }
            isStreaming={isGenerating && isLast && message.role === "assistant"}
          />
        )
      })}
    </div>
  )
}