import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { Tooltip } from "@/components/ui/Tooltip"
import { useState } from "react"
import { ChatAttachment } from "@/lib/chat-types"
import { Copy, FileText, Pencil, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react"

interface MessageBubbleProps {
  role: "user" | "assistant"
  content: string
  attachments?: ChatAttachment[]
  onRegenerate?: () => void
  onEdit?: () => void
  onFeedback?: (feedback: "positive" | "negative") => void
  isStreaming?: boolean
}

export function MessageBubble({ role, content, attachments, onRegenerate, onEdit, onFeedback, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<"positive" | "negative" | null>(null)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const handleFeedback = (feedback: "positive" | "negative") => {
    setSelectedFeedback(feedback)
    onFeedback?.(feedback)
  }

  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} ${isStreaming ? "animate-in fade-in-50" : ""}`}>
      <div className={`${role === "user" ? "max-w-[88%] rounded-[22px] rounded-tr-md bg-[#3a3a3a] px-4 py-3 text-white sm:max-w-[78%]" : "w-full max-w-[92%] text-white/90 sm:max-w-[82%]"}`}>
        <ReactMarkdown
          className="prose prose-sm prose-invert max-w-none prose-p:my-0 prose-p:leading-7 prose-headings:text-white prose-strong:text-white prose-li:leading-7 prose-a:text-blue-300 prose-a:no-underline hover:prose-a:underline prose-pre:my-3 prose-pre:bg-transparent prose-pre:p-0"
          components={{
            code({ className, children, ...props }: any) {
              const inline = !className?.includes("language-")
              const match = /language-(\w+)/.exec(className || "")
              return !inline && match ? (
                <div className="relative my-3 overflow-hidden rounded-xl border border-white/[0.08]">
                  <div className="absolute right-2 top-2 z-10">
                    <Tooltip content={copied ? "Copied!" : "Copy code"}>
                      <button onClick={copyToClipboard} className="rounded-lg bg-black/35 p-1.5 text-white/70 transition hover:bg-black/55 hover:text-white" aria-label="Copy code">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                  <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" className="!m-0 !rounded-none !bg-[#1a1a1a] text-xs sm:text-sm" {...props}>
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className={`${role === "user" ? "bg-white/10 text-white" : "bg-white/[0.08] text-white/90"} rounded px-1.5 py-0.5 text-sm`} {...props}>
                  {children}
                </code>
              )
            },
            table({ children }) {
              return <div className="my-3 overflow-x-auto"><table className="border-collapse border border-white/10 text-sm">{children}</table></div>
            },
            th({ children }) {
              return <th className="border border-white/10 bg-white/[0.06] p-2 text-left">{children}</th>
            },
            td({ children }) {
              return <td className="border border-white/10 p-2">{children}</td>
            },
            a({ href, children }) {
              return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
            },
          }}
        >
          {content}
        </ReactMarkdown>

        {attachments && attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <a
                key={`${attachment.name}-${attachment.size}`}
                href={attachment.dataUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={attachment.name}
                className="flex max-w-full items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-2 text-xs text-white/80 transition hover:bg-black/35"
              >
                {attachment.type.startsWith("image/") ? (
                  <img src={attachment.dataUrl} alt={attachment.name} className="max-h-36 max-w-[220px] rounded-lg object-contain" />
                ) : (
                  <>
                    <FileText className="h-4 w-4 shrink-0 text-white/60" />
                    <span className="max-w-[220px] truncate">{attachment.name}</span>
                  </>
                )}
              </a>
            ))}
          </div>
        )}

        {isStreaming && <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-blue-300 align-middle" />}

        {role === "assistant" && !isStreaming && content && (
          <div className="mt-3 flex items-center gap-0.5 border-t border-white/[0.08] pt-2 text-white/45">
            <Tooltip content={copied ? "Copied!" : "Copy response"}>
              <button onClick={copyToClipboard} className="rounded-lg p-1.5 transition hover:bg-white/[0.08] hover:text-white" aria-label="Copy response">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            {onRegenerate && <Tooltip content="Regenerate"><button onClick={onRegenerate} className="rounded-lg p-1.5 transition hover:bg-white/[0.08] hover:text-white" aria-label="Regenerate response"><RotateCcw className="h-3.5 w-3.5" /></button></Tooltip>}
            <Tooltip content={selectedFeedback === "positive" ? "Thanks for the feedback" : "Good response"}>
              <button onClick={() => handleFeedback("positive")} className={`rounded-lg p-1.5 transition hover:bg-white/[0.08] hover:text-white ${selectedFeedback === "positive" ? "bg-emerald-500/20 text-emerald-200" : ""}`} aria-label="Good response" aria-pressed={selectedFeedback === "positive"}>
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content={selectedFeedback === "negative" ? "Thanks for the feedback" : "Bad response"}>
              <button onClick={() => handleFeedback("negative")} className={`rounded-lg p-1.5 transition hover:bg-white/[0.08] hover:text-white ${selectedFeedback === "negative" ? "bg-red-500/20 text-red-200" : ""}`} aria-label="Bad response" aria-pressed={selectedFeedback === "negative"}>
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </div>
        )}

        {role === "user" && onEdit && !isStreaming && (
          <Tooltip content="Edit message"><button onClick={onEdit} className="mt-2 rounded-lg p-1.5 text-white/55 transition hover:bg-white/[0.08] hover:text-white" aria-label="Edit message"><Pencil className="h-3.5 w-3.5" /></button></Tooltip>
        )}
      </div>
    </div>
  )
}
