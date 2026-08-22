"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/Input"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search conversations..."
        className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      />
    </div>
  )
}