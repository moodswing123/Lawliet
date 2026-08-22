"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { ConversationList } from "./ConversationList"
import { SearchBar } from "./SearchBar"
import { Plus, LogOut, Settings, Menu } from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  conversations: any[]
  onSelect: (id: string | null) => void
  onDelete: (id: string) => void
  onRename: (id: string, newTitle: string) => void
  onNewChat: () => void
}

export function Sidebar({
  conversations,
  onSelect,
  onDelete,
  onRename,
  onNewChat,
}: SidebarProps) {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              L
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Lawliet
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-3">
        <Button onClick={onNewChat} className="w-full justify-start gap-2">
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 scrollbar-hide">
        <ConversationList
          conversations={filteredConversations}
          onSelect={onSelect}
          onDelete={onDelete}
          onRename={onRename}
        />
      </div>

      {/* User Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-2">
        <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300">
          <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="flex-1 truncate">
            {session?.user?.name || session?.user?.email}
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => (window.location.href = "/settings")}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}