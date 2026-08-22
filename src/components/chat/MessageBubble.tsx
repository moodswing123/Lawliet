"use client"

import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow, oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { useTheme } from "next-themes"
import { Tooltip } from "@/components/ui/Tooltip"
import { useState } from "react"
import { Copy, Pencil, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react"

interface MessageBubbleProps {
  role: "user" | "assistant"
  content: string
  onRegenerate?: () => void
  onEdit?: () => void
  isStreaming?: boolean
}

export function MessageBubble({
  role,
  content,
  onRegenerate,
  onEdit,
  isStreaming,
}: MessageBubbleProps) {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`flex ${role === "user" ? "justify-end" : "justify-start"} ${
        isStreaming ? "animate-in fade-in-50" : ""
      }`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] ${
          role === "user"
            ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm"
        } px-4 py-3`}
      >
        <ReactMarkdown
          className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0"
          components={{
            code({ className, children, ...props }: any) {
              const inline = !className?.includes("language-")
              const match = /language-(\w+)/.exec(className || "")
              return !inline && match ? (
                <div className="relative my-2">
                  <div className="absolute right-2 top-2 z-10">
                    <Tooltip content={copied ? "Copied!" : "Copy code"}>
                      <button
                        onClick={copyToClipboard}
                        className="p-1.5 rounded bg-gray-800/80 text-white hover:bg-gray-700/80 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                  <SyntaxHighlighter
                    style={theme === "dark" ? oneDark : tomorrow}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-lg text-xs sm:text-sm"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code
                  className={`${
                    role === "user"
                      ? "bg-blue-700/50 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  } px-1.5 py-0.5 rounded text-sm`}
                  {...props}
                >
                  {children}
                </code>
              )
            },
            table({ children }) {
              return (
                <div className="overflow-x-auto my-2">
                  <table className="border-collapse border border-gray-300 dark:border-gray-700 text-sm">
                    {children}
                  </table>
                </div>
              )
            },
            th({ children }) {
              return (
                <th className="border border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-800 p-2 text-left">
                  {children}
                </th>
              )
            },
            td({ children }) {
              return (
                <td className="border border-gray-300 dark:border-gray-700 p-2">
                  {children}
                </td>
              )
            },
            a({ href, children }) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {children}
                </a>
              )
            },
          }}
        >
          {content}
        </ReactMarkdown>

        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-blue-400 dark:bg-blue-300 animate-pulse" />
        )}

        {/* Message Actions */}
        {role === "assistant" && !isStreaming && content && (
          <div className="flex items-center gap-0.5 mt-3 pt-2 border-t border-gray-200/30 dark:border-gray-700/30">
            <Tooltip content={copied ? "Copied!" : "Copy response"}>
              <button
                onClick={copyToClipboard}
                className="p-1.5 hover:bg-gray-200/40 dark:hover:bg-gray-700/40 rounded transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            {onRegenerate && (
              <Tooltip content="Regenerate">
                <button
                  onClick={onRegenerate}
                  className="p-1.5 hover:bg-gray-200/40 dark:hover:bg-gray-700/40 rounded transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            )}
            <Tooltip content="Good response">
              <button className="p-1.5 hover:bg-gray-200/40 dark:hover:bg-gray-700/40 rounded transition">
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Bad response">
              <button className="p-1.5 hover:bg-gray-200/40 dark:hover:bg-gray-700/40 rounded transition">
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>
        )}

        {role === "user" && onEdit && !isStreaming && (
          <Tooltip content="Edit message">
            <button
              onClick={onEdit}
              className="mt-2 p-1.5 hover:bg-gray-200/40 dark:hover:bg-gray-700/40 rounded transition"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  )
}