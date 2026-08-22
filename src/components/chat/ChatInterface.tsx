"use client"

import { useRef, useEffect, useState } from "react"
import { MessageList } from "./MessageList"
import { Composer } from "./Composer"
import { EmptyState } from "./EmptyState"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface ChatInterfaceProps {
  messages: any[]
  onSend: (message: string) => void
  onRegenerate: (messageId: string) => void
  onEdit: (messageId: string, newContent: string) => void
  onStop: () => void
  isGenerating: boolean
  isLoading: boolean
  onMenuClick: () => void
  conversation: any
}

export function ChatInterface({
  messages,
  onSend,
  onRegenerate,
  onEdit,
  onStop,
  isGenerating,
  isLoading,
  onMenuClick,
  conversation,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)

  useEffect(() => {
    if (!isUserScrolling && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isUserScrolling])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 100
    setIsUserScrolling(!isNearBottom)
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800 md:hidden">
        <Button variant="ghost" size="sm" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-gray-900 dark:text-white">
          {conversation?.title || "Lawliet"}
        </span>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto scrollbar-hide"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <EmptyState onSend={onSend} />
        ) : (
          <MessageList
            messages={messages}
            onRegenerate={onRegenerate}
            onEdit={onEdit}
            isGenerating={isGenerating}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <Composer
        onSend={onSend}
        onStop={onStop}
        isGenerating={isGenerating}
        disabled={isLoading}
      />
    </div>
  )
}