import { useState, useRef, useEffect, KeyboardEvent } from "react"
import { Tooltip } from "@/components/ui/Tooltip"
import { ChatAttachment } from "@/lib/chat-types"
import { Mic, Paperclip, Send, Square, X, FileText } from "lucide-react"

interface ComposerProps {
  onSend: (message: string, attachments?: ChatAttachment[]) => void
  onStop: () => void
  isGenerating: boolean
  disabled?: boolean
}

const MAX_FILE_SIZE = 2 * 1024 * 1024

export function Composer({ onSend, onStop, isGenerating, disabled }: ComposerProps) {
  const [input, setInput] = useState("")
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [attachmentError, setAttachmentError] = useState("")
  const [isListening, setIsListening] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
    }
  }, [input])

  const handleSubmit = () => {
    if ((!input.trim() && attachments.length === 0) || isGenerating || disabled) return

    onSend(input.trim() || "Please analyze the attached file.", attachments.length ? attachments : undefined)
    setInput("")
    setAttachments([])
    setAttachmentError("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return
    setAttachmentError("")

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setAttachmentError(`${file.name} is larger than the 2 MB upload limit.`)
        return
      }

      if (!file.type && !file.name.match(/\.(txt|md|csv|json|pdf)$/i)) {
        setAttachmentError(`${file.name} has an unsupported file type.`)
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = typeof reader.result === "string" ? reader.result : ""
        if (!dataUrl) return
        setAttachments((previous) => [
          ...previous,
          { name: file.name, type: file.type || "application/octet-stream", size: file.size, dataUrl },
        ])
      }
      reader.onerror = () => setAttachmentError(`Could not read ${file.name}.`)
      reader.readAsDataURL(file)
    })
  }

  const removeAttachment = (name: string) => {
    setAttachments((previous) => previous.filter((attachment) => attachment.name !== name))
  }

  const handleVoiceInput = () => {
    if (isListening) return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setAttachmentError("Voice input is not supported by this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.continuous = false
    setIsListening(true)
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || ""
      setInput((previous) => `${previous}${previous ? " " : ""}${transcript}`)
    }
    recognition.onerror = () => setAttachmentError("Voice input could not be started.")
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  const canSend = Boolean(input.trim()) || attachments.length > 0

  return (
    <div className="shrink-0 bg-[#111111] px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-3xl">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div key={`${attachment.name}-${attachment.size}`} className="flex max-w-full items-center gap-2 rounded-xl border border-white/10 bg-[#252525] px-2 py-1.5 text-xs text-white/80">
                {attachment.type.startsWith("image/") ? (
                  <img src={attachment.dataUrl} alt={attachment.name} className="h-8 w-8 rounded-md object-cover" />
                ) : (
                  <FileText className="h-4 w-4 shrink-0 text-white/60" />
                )}
                <span className="max-w-[180px] truncate">{attachment.name}</span>
                <button type="button" onClick={() => removeAttachment(attachment.name)} className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white" aria-label={`Remove ${attachment.name}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-1.5 rounded-[25px] border border-white/[0.09] bg-[#252525] p-2 shadow-[0_10px_35px_rgba(0,0,0,0.22)] transition focus-within:border-white/20 focus-within:ring-2 focus-within:ring-white/[0.06]">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.txt,.csv,.json,.md"
            multiple
            className="hidden"
            onChange={(event) => {
              handleFiles(event.target.files)
              event.target.value = ""
            }}
          />
          <Tooltip content="Attach files">
            <button
              type="button"
              className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/55 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              disabled={disabled || isGenerating}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach files"
            >
              <Paperclip className="h-[20px] w-[20px]" />
            </button>
          </Tooltip>

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
            <Tooltip content={isListening ? "Listening..." : "Voice input"}>
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-white/[0.08] hover:text-white ${isListening ? "bg-blue-500/20 text-blue-200" : "text-white/45"}`}
                aria-label={isListening ? "Listening" : "Voice input"}
              >
                <Mic className="h-[20px] w-[20px]" />
              </button>
            </Tooltip>
          )}
        </div>
        {attachmentError && <p className="pt-1 text-center text-xs text-red-300">{attachmentError}</p>}
        <p className="pt-2 text-center text-[11px] text-white/30">Lawliet can make mistakes. Check important information.</p>
      </div>
    </div>
  )
}
