"use client"

import { useRef, useEffect, useState } from "react"
import { MessageList } from "./MessageList"
import { Composer } from "./Composer"
import { EmptyState } from "./EmptyState"
import { BarChart3, ChevronDown, Menu, MoreHorizontal, Share2 } from "lucide-react"
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
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100
    setIsUserScrolling(!isNearBottom)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#111111] text-white">
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#111111]/95 px-3 backdrop-blur-xl sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="h-10 w-10 rounded-full p-0 text-white/65 hover:bg-white/[0.08] hover:text-white md:hidden"
            aria-label="Open conversations"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <button className="flex min-w-0 items-center gap-1.5 rounded-xl px-2 py-1.5 text-left transition hover:bg-white/[0.06]">
            <span className="truncate text-[17px] font-semibold tracking-[-0.01em] text-white">
              {conversation?.title || "Lawliet 1.6 Lite"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-white/55" />
          </button>
        </div>

        <div className="flex items-center gap-0.5 text-white/65">
          <button className="hidden h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/[0.08] hover:text-white sm:flex" aria-label="Share conversation">
            <Share2 className="h-[19px] w-[19px]" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/[0.08] hover:text-white" aria-label="Conversation activity">
            <BarChart3 className="h-[20px] w-[20px]" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/[0.08] hover:text-white" aria-label="More options">
            <MoreHorizontal className="h-[21px] w-[21px]" />
          </button>
        </div>
      </header>

      <div className="relative flex-1 overflow-y-auto overscroll-contain scrollbar-hide" onScroll={handleScroll}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#111111] to-transparent" />
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

      <Composer
        onSend={onSend}
        onStop={onStop}
        isGenerating={isGenerating}
        disabled={isLoading}
      />
    </div>
  )
}
