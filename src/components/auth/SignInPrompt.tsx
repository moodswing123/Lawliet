"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"

export function SignInPrompt() {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
          <span className="text-3xl font-bold text-white">L</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to Lawliet
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sign in to access your conversations and AI assistant
        </p>
        <div className="space-y-3">
          <Link href="/auth/signin" className="block">
            <Button className="w-full">Sign In</Button>
          </Link>
          <Link href="/auth/signup" className="block">
            <Button variant="outline" className="w-full">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}