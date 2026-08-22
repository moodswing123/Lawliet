"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

export function useConversation() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<any[]>([])
  const [currentConversation, setCurrentConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      const res = await fetch("/api/chat/conversations")
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch (error) {
      console.error("Failed to load conversations:", error)
    }
  }, [session])

  // Load conversation messages
  const loadConversation = useCallback(
    async (conversationId: string | null) => {
      if (!session?.user?.id) {
        setMessages([])
        setCurrentConversation(null)
        return
      }

      setIsLoading(true)
      try {
        if (conversationId) {
          const res = await fetch(`/api/chat/${conversationId}`)
          if (res.ok) {
            const data = await res.json()
            setCurrentConversation(data)
            setMessages(data.messages || [])
          } else {
            setCurrentConversation(null)
            setMessages([])
          }
        } else {
          setCurrentConversation(null)
          setMessages([])
        }
        await loadConversations()
      } catch (error) {
        console.error("Failed to load conversation:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [session, loadConversations]
  )

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!session?.user?.id || !content.trim()) return

      const tempMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, tempMessage])
      setIsGenerating(true)

      const controller = new AbortController()
      setAbortController(controller)

      const messagesToSend = [
        ...messages,
        { role: "user", content: content.trim() },
      ]

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messagesToSend,
            conversationId: currentConversation?.id,
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        let assistantContent = ""
        let newConversationId = currentConversation?.id

        // Add placeholder assistant message
        const assistantId = `assistant-${Date.now()}`
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            isStreaming: true,
          },
        ])

        while (reader) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6))
              if (data.error) {
                throw new Error(data.error)
              }
              if (data.done) {
                if (data.conversationId) {
                  newConversationId = data.conversationId
                }
                // Mark as done
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, isStreaming: false }
                      : msg
                  )
                )
                break
              }
              if (data.content) {
                assistantContent += data.content
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                )
              }
            }
          }
        }

        // Reload conversations to update title
        await loadConversations()

        // If new conversation, update current
        if (newConversationId && !currentConversation) {
          await loadConversation(newConversationId)
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Send message error:", error)
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: "assistant",
              content: `❌ Error: ${error.message || "Failed to send message"}`,
            },
          ])
        }
      } finally {
        setIsGenerating(false)
        setAbortController(null)
      }
    },
    [session, messages, currentConversation, loadConversations, loadConversation]
  )

  // Stop generation
  const stopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsGenerating(false)
    }
  }, [abortController])

  // Regenerate message
  const regenerateMessage = useCallback(
    async (messageId: string) => {
      const index = messages.findIndex((m) => m.id === messageId)
      if (index === -1) return

      // Get the previous user message
      const userMessage = messages.slice(0, index).reverse().find((m) => m.role === "user")
      if (!userMessage) return

      // Remove the assistant message and all messages after it
      const newMessages = messages.slice(0, index)
      setMessages(newMessages)

      // Resend the user message
      await sendMessage(userMessage.content)
    },
    [messages, sendMessage]
  )

  // Edit message
  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      const index = messages.findIndex((m) => m.id === messageId)
      if (index === -1) return

      // Update the message content
      const updatedMessages = [...messages]
      updatedMessages[index] = { ...updatedMessages[index], content: newContent }

      // Remove all messages after this one
      const truncatedMessages = updatedMessages.slice(0, index + 1)
      setMessages(truncatedMessages)

      // Resend the edited message
      await sendMessage(newContent)
    },
    [messages, sendMessage]
  )

  // Delete conversation
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        const res = await fetch(`/api/chat/${conversationId}`, {
          method: "DELETE",
        })
        if (res.ok) {
          setConversations((prev) => prev.filter((c) => c.id !== conversationId))
          if (currentConversation?.id === conversationId) {
            setCurrentConversation(null)
            setMessages([])
          }
        }
      } catch (error) {
        console.error("Failed to delete conversation:", error)
      }
    },
    [currentConversation]
  )

  // Rename conversation
  const renameConversation = useCallback(
    async (conversationId: string, newTitle: string) => {
      try {
        const res = await fetch(`/api/chat/${conversationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        })
        if (res.ok) {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === conversationId ? { ...c, title: newTitle } : c
            )
          )
          if (currentConversation?.id === conversationId) {
            setCurrentConversation((prev: any) => ({ ...prev, title: newTitle }))
          }
        }
      } catch (error) {
        console.error("Failed to rename conversation:", error)
      }
    },
    [currentConversation]
  )

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isGenerating,
    sendMessage,
    regenerateMessage,
    editMessage,
    deleteConversation,
    renameConversation,
    loadConversation,
    stopGeneration,
  }
}