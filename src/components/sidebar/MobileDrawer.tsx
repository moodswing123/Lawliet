"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { ConversationList } from "./ConversationList"
import { SearchBar } from "./SearchBar"
import { Plus, LogOut, Settings, X } from "lucide-react"
import { useState, useEffect } from "react"

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  conversations: any[]
  onSelect: (id: string | null) => void
  onDelete: (id: string) => void
  onRename: (id: string, newTitle: string) => void
  onNewChat: () => void
}

export function MobileDrawer({
  isOpen,
  onClose,
  conversations,
  onSelect,
  onDelete,
  onRename,
  onNewChat,
}: MobileDrawerProps) {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 z-50 w-80 bg-gray-50 dark:bg-gray-900 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                L
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Lawliet
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-3">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* New Chat */}
          <div className="px-3 pb-3">
            <Button
              onClick={() => {
                onNewChat()
                onClose()
              }}
              className="w-full justify-start gap-2"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto px-2 scrollbar-hide">
            <ConversationList
              conversations={filteredConversations}
              onSelect={(id) => {
                onSelect(id)
                onClose()
              }}
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
                onClick={() => {
                  window.location.href = "/settings"
                  onClose()
                }}
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
      </div>
    </>
  )
}