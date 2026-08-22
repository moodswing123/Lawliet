"use client"

import { useState, useRef, useEffect, KeyboardEvent } from "react"
import { Tooltip } from "@/components/ui/Tooltip"
import { Mic, Paperclip, Send, Square } from "lucide-react"

interface ComposerProps {
  onSend: (message: string) => void
  onStop: () => void
  isGenerating: boolean
  disabled?: boolean
}

export function Composer({ onSend, onStop, isGenerating, disabled }: ComposerProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
    }
  }, [input])

  const handleSubmit = () => {
    if (input.trim() && !isGenerating && !disabled) {
      onSend(input.trim())
      setInput("")
      if (textareaRef.current) textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSend = Boolean(input.trim()) && !disabled

  return (
    <div className="shrink-0 bg-[#111111] px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-1.5 rounded-[25px] border border-white/[0.09] bg-[#252525] p-2 shadow-[0_10px_35px_rgba(0,0,0,0.22)] transition focus-within:border-white/20 focus-within:ring-2 focus-within:ring-white/[0.06]">
          <button
            type="button"
            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/55 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            disabled
            aria-label="Attach a file"
          >
            <Paperclip className="h-[20px] w-[20px]" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Lawliet"
            rows={1}
            disabled={disabled || isGenerating}
            className="max-h-[180px] min-h-10 flex-1 resize-none border-0 bg-transparent px-1 py-2.5 text-[16px] leading-5 text-white outline-none placeholder:text-white/35 disabled:opacity-50"
            aria-label="Message Lawliet"
          />

          {isGenerating ? (
            <Tooltip content="Stop generating">
              <button
                type="button"
                onClick={onStop}
                className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#171717] transition hover:bg-white/85"
                aria-label="Stop generating"
              >
                <Square className="h-4 w-4 fill-current" />
              </button>
            </Tooltip>
          ) : canSend ? (
            <Tooltip content="Send message">
              <button
                type="button"
                onClick={handleSubmit}
                className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#171717] transition hover:bg-white/85"
                aria-label="Send message"
              >
                <Send className="h-[18px] w-[18px]" />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/45 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Voice input"
            >
              <Mic className="h-[20px] w-[20px]" />
            </button>
          )}
        </div>
        <p className="pt-2 text-center text-[11px] text-white/30">Lawliet can make mistakes. Check important information.</p>
      </div>
    </div>
  )
}
