"use client"

import { useState } from "react"
import { formatDate } from "@/lib/utils"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"

interface ConversationListProps {
  conversations: any[]
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, newTitle: string) => void
}

export function ConversationList({
  conversations,
  onSelect,
  onDelete,
  onRename,
}: ConversationListProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Group conversations
  const now = new Date()
  const groups: Record<string, any[]> = {
    Today: [],
    Yesterday: [],
    "Last 7 Days": [],
    Older: [],
  }

  conversations.forEach((conv) => {
    const date = new Date(conv.createdAt)
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) groups.Today.push(conv)
    else if (days === 1) groups.Yesterday.push(conv)
    else if (days < 7) groups["Last 7 Days"].push(conv)
    else groups.Older.push(conv)
  })

  const handleRename = () => {
    if (renameId && newTitle.trim()) {
      onRename(renameId, newTitle.trim())
      setRenameId(null)
      setNewTitle("")
    }
  }

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([label, convs]) => {
        if (convs.length === 0) return null
        return (
          <div key={label}>
            <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              {label}
            </div>
            {convs.map((conv) => (
              <div
                key={conv.id}
                className="group relative flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition"
              >
                <div
                  className="flex-1 min-w-0"
                  onClick={() => onSelect(conv.id)}
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {conv.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(conv.createdAt)}
                  </div>
                </div>

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() =>
                      setOpenMenu(openMenu === conv.id ? null : conv.id)
                    }
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>

                  {openMenu === conv.id && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                      <button
                        className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        onClick={() => {
                          setRenameId(conv.id)
                          setNewTitle(conv.title)
                          setOpenMenu(null)
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                        Rename
                      </button>
                      <button
                        className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                        onClick={() => {
                          setDeleteId(conv.id)
                          setOpenMenu(null)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      })}

      {/* Rename Modal */}
      <Modal
        isOpen={!!renameId}
        onClose={() => setRenameId(null)}
        title="Rename Conversation"
      >
        <div className="space-y-4">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter new title"
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setRenameId(null)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Conversation"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this conversation? This action cannot
            be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId)
                  setDeleteId(null)
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}