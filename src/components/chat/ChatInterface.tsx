import { useRef, useEffect, useState } from "react"
import { MessageList } from "./MessageList"
import { Composer } from "./Composer"
import { EmptyState } from "./EmptyState"
import { BarChart3, Check, ChevronDown, Copy, Menu, MoreHorizontal, Share2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { ChatAttachment } from "@/lib/chat-types"

interface ChatInterfaceProps {
  messages: any[]
  onSend: (message: string, attachments?: ChatAttachment[]) => void
  onRegenerate: (messageId: string) => void
  onEdit: (messageId: string, newContent: string) => void
  onFeedback: (messageId: string, feedback: "positive" | "negative") => void
  onStop: () => void
  onNewChat: () => void
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
  onFeedback,
  onStop,
  onNewChat,
  isGenerating,
  isLoading,
  onMenuClick,
  conversation,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [shareState, setShareState] = useState<"idle" | "copied">("idle")

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

  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        return true
      }
    } catch {
      // Fall through to the legacy browser copy command.
    }

    try {
      const helper = document.createElement("textarea")
      helper.value = text
      helper.setAttribute("readonly", "")
      helper.style.position = "fixed"
      helper.style.opacity = "0"
      document.body.appendChild(helper)
      helper.select()
      const copied = document.execCommand("copy")
      document.body.removeChild(helper)
      return copied
    } catch {
      return false
    }
  }

  const showCopiedState = () => {
    setShareState("copied")
    window.setTimeout(() => setShareState("idle"), 1800)
  }

  const handleShare = async () => {
    if (!conversation) return
    const shareText = `${conversation.title || "Lawliet conversation"}\n${window.location.origin}/?conversation=${conversation.id}`
    if (await copyText(shareText)) showCopiedState()
  }

  const handleCopyConversation = async () => {
    const transcript = messages
      .map((message) => `${message.role === "user" ? "You" : "Lawliet"}: ${message.content}`)
      .join("\n\n")
    setShowMenu(false)
    if (await copyText(transcript)) showCopiedState()
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
          <button
            type="button"
            onClick={() => setShowActivity(true)}
            className="flex min-w-0 items-center gap-1.5 rounded-xl px-2 py-1.5 text-left transition hover:bg-white/[0.06]"
            aria-label="View conversation details"
          >
            <span className="truncate text-[17px] font-semibold tracking-[-0.01em] text-white">
              {conversation?.title || "Lawliet 1.6 Lite"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-white/55" />
          </button>
        </div>

        <div className="relative flex items-center gap-0.5 text-white/65">
          <button
            type="button"
            onClick={handleShare}
            disabled={!conversation}
            className="hidden h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
            aria-label="Share conversation"
          >
            {shareState === "copied" ? <Check className="h-[19px] w-[19px]" /> : <Share2 className="h-[19px] w-[19px]" />}
          </button>
          <button
            type="button"
            onClick={() => setShowActivity(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Conversation activity"
          >
            <BarChart3 className="h-[20px] w-[20px]" />
          </button>
          <button
            type="button"
            onClick={() => setShowMenu((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/[0.08] hover:text-white"
            aria-label="More options"
            aria-expanded={showMenu}
          >
            <MoreHorizontal className="h-[21px] w-[21px]" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-12 z-30 w-48 rounded-xl border border-white/10 bg-[#242424] p-1.5 shadow-2xl">
              <button type="button" onClick={handleCopyConversation} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/[0.08] hover:text-white">
                <Copy className="h-4 w-4" />
                Copy conversation
              </button>
              <button type="button" onClick={() => { setShowMenu(false); onNewChat() }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/[0.08] hover:text-white">
                New chat
              </button>
              <button type="button" onClick={() => { setShowMenu(false); window.location.href = "/settings" }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/[0.08] hover:text-white">
                Settings
              </button>
            </div>
          )}
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
            onFeedback={onFeedback}
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

      <Modal
        isOpen={showActivity}
        onClose={() => setShowActivity(false)}
        title="Conversation activity"
      >
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <p><span className="font-medium text-gray-900 dark:text-white">Title:</span> {conversation?.title || "New chat"}</p>
          <p><span className="font-medium text-gray-900 dark:text-white">Messages:</span> {messages.length}</p>
          {conversation?.createdAt && <p><span className="font-medium text-gray-900 dark:text-white">Created:</span> {new Date(conversation.createdAt).toLocaleString()}</p>}
          {conversation?.updatedAt && <p><span className="font-medium text-gray-900 dark:text-white">Last updated:</span> {new Date(conversation.updatedAt).toLocaleString()}</p>}
        </div>
      </Modal>
    </div>
  )
}
