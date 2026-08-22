"use client"

import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/sidebar/Sidebar"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { MobileDrawer } from "@/components/sidebar/MobileDrawer"
import { useConversation } from "@/hooks/useConversation"
import { useState } from "react"
import { SignInPrompt } from "@/components/auth/SignInPrompt"

export default function Home() {
  const { data: session, status } = useSession()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    sendMessage,
    regenerateMessage,
    editMessage,
    deleteConversation,
    renameConversation,
    submitFeedback,
    loadConversation,
    stopGeneration,
    isGenerating,
  } = useConversation()

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading Lawliet...</div>
      </div>
    )
  }

  if (!session) {
    return <SignInPrompt />
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 min-w-[256px] border-r border-gray-200 dark:border-gray-800">
        <Sidebar
          conversations={conversations}
          onSelect={loadConversation}
          onDelete={deleteConversation}
          onRename={renameConversation}
          onNewChat={() => loadConversation(null)}
        />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        conversations={conversations}
        onSelect={(id) => {
          loadConversation(id)
          setIsMobileOpen(false)
        }}
        onDelete={deleteConversation}
        onRename={renameConversation}
        onNewChat={() => {
          loadConversation(null)
          setIsMobileOpen(false)
        }}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
                  <ChatInterface
            messages={messages}
            onSend={sendMessage}
            onRegenerate={regenerateMessage}
            onEdit={editMessage}
            onFeedback={submitFeedback}
            onStop={stopGeneration}
            onNewChat={() => loadConversation(null)}

          isGenerating={isGenerating}
          isLoading={isLoading}
          onMenuClick={() => setIsMobileOpen(true)}
          conversation={currentConversation}
        />
      </div>
    </div>
  )
}