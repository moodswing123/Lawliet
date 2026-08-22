"use client"

import { ArrowUpRight, Brain, Code2, Lightbulb, Sparkles } from "lucide-react"

const suggestions = [
  { label: "Explain something simply", icon: Brain },
  { label: "Help me write", icon: Code2 },
  { label: "Give me ideas", icon: Lightbulb },
]

interface EmptyStateProps {
  onSend: (message: string) => void
}

export function EmptyState({ onSend }: EmptyStateProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-5 pb-24 pt-16 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-500 to-violet-600 shadow-[0_8px_30px_rgba(99,102,241,0.28)]">
        <Sparkles className="h-7 w-7 text-white" />
      </div>
      <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-white sm:text-3xl">How can I help?</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-white/45">Ask Lawliet anything, or start with one of these ideas.</p>

      <div className="mt-8 flex max-w-xl flex-wrap justify-center gap-2.5">
        {suggestions.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => onSend(label)}
            className="group flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.035] px-3.5 py-2.5 text-left text-sm text-white/65 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            <Icon className="h-4 w-4 text-white/45 transition group-hover:text-blue-300" />
            <span>{label}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-white/25" />
          </button>
        ))}
      </div>
    </div>
  )
}
