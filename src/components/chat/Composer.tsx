"use client"

import { useState, useRef, useEffect, KeyboardEvent } from "react"
import { Button } from "@/components/ui/Button"
import { Tooltip } from "@/components/ui/Tooltip"
import { Send, Square, Paperclip } from "lucide-react"

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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSubmit = () => {
    if (input.trim() && !isGenerating && !disabled) {
      onSend(input.trim())
      setInput("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-2 focus-within:ring-2 focus-within:ring-blue-500 transition">
          <button
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            disabled
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            rows={1}
            disabled={disabled || isGenerating}
            className="flex-1 bg-transparent border-0 resize-none outline-none px-1 py-2 max-h-[200px] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
          />

          {isGenerating ? (
            <Button
              onClick={onStop}
              variant="outline"
              size="sm"
              className="flex-shrink-0 gap-1 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          ) : (
            <Tooltip content="Send message (Enter)">
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || disabled}
                className="flex-shrink-0"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}