"use client"

import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { useRouter } from "next/navigation"
import { ArrowLeft, Moon, Sun, Monitor, Trash2, LogOut } from "lucide-react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [clearConfirm, setClearConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/user/settings")
        if (res.ok) {
          const data = await res.json()
          setSettings(data)
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const updateSettings = async (updates: any) => {
    setSaving(true)
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Failed to update settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    updateSettings({ theme: newTheme })
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ model: e.target.value })
  }

  const handleClearConversations = async () => {
    setClearConfirm(false)
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "DELETE",
      })
      if (res.ok) {
        // Reload page to refresh conversations
        router.push("/")
      }
    } catch (error) {
      console.error("Failed to clear conversations:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customize your Lawliet experience
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Appearance
            </h2>
            <div className="flex gap-3">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => handleThemeChange("light")}
                className="flex-1 gap-2"
              >
                <Sun className="w-4 h-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => handleThemeChange("dark")}
                className="flex-1 gap-2"
              >
                <Moon className="w-4 h-4" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => handleThemeChange("system")}
                className="flex-1 gap-2"
              >
                <Monitor className="w-4 h-4" />
                System
              </Button>
            </div>
          </section>

          {/* Model Settings */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Model Settings
            </h2>
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                AI Model
              </label>
              <select
                value={settings.model || "gpt-4-turbo-preview"}
                onChange={handleModelChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className={`w-2 h-2 rounded-full ${saving ? "animate-pulse bg-yellow-500" : "bg-green-500"}`} />
                {saving ? "Saving..." : "Settings saved"}
              </div>
            </div>
          </section>

          {/* Account */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Account
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {session?.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {session?.user?.name || "User"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {session?.user?.email}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-red-200 dark:border-red-900/50">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              Danger Zone
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Clear all conversations and chat history. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={() => setClearConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
                Clear All Conversations
              </Button>
            </div>
          </section>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={clearConfirm}
        onClose={() => setClearConfirm(false)}
        title="Clear All Conversations?"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            This will permanently delete all your conversations and messages. This
            action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setClearConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearConversations}>
              Yes, Delete Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}