"use client"

import { Sparkles, MessageSquare, Zap, Brain } from "lucide-react"

const suggestions = [
  "Explain quantum computing in simple terms",
  "Write a Python script to scrape a website",
  "Help me plan a healthy meal prep routine",
  "Summarize the latest AI research trends",
]

interface EmptyStateProps {
  onSend: (message: string) => void
}

export function EmptyState({ onSend }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4 py-12 text-center animate-in fade-in-50">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome to Lawliet
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Your intelligent AI companion. Ask me anything—I'm here to help you think, create, and explore.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSend(suggestion)}
            className="p-4 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {index === 0 && <Brain className="w-4 h-4 text-blue-500" />}
                {index === 1 && <Zap className="w-4 h-4 text-yellow-500" />}
                {index === 2 && <Sparkles className="w-4 h-4 text-purple-500" />}
                {index === 3 && <MessageSquare className="w-4 h-4 text-green-500" />}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition">
                {suggestion}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}