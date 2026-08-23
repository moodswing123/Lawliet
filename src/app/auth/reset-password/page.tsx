"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

const SUPPORT_EMAIL = "support.lawlietgpt@gmail.com"

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">{children}</div>
    </div>
  )
}

function SupportLink() {
  return (
    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
      Need help?{" "}
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        Contact LawlietGPT Support
      </a>
    </p>
  )
}

function RequestResetForm() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error || "We could not send the reset email. Please try again.")
        return
      }

      setSubmitted(true)
    } catch {
      setError("We could not reach LawlietGPT. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Check your email</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            If an account exists for <strong>{email}</strong>, we sent a reset link. The link expires in 30 minutes and can only be used once.
          </p>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
            If you do not see it, check your spam or promotions folder.
          </p>
        </div>
        <div className="space-y-3">
          <Link href="/auth/signin" className="text-blue-600 dark:text-blue-400 hover:underline block text-center">
            Back to sign in
          </Link>
          <SupportLink />
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Enter your email to receive a secure reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div role="alert" className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending reset link..." : "Send Reset Link"}
        </Button>

        <div className="text-center text-sm">
          <Link href="/auth/signin" className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to sign in
          </Link>
        </div>
        <SupportLink />
      </form>
    </AuthShell>
  )
}

function CompleteResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [updated, setUpdated] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/auth/reset-password/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error || "This reset link is invalid or expired.")
        return
      }

      setUpdated(true)
    } catch {
      setError("We could not reach LawlietGPT. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (updated) {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Password updated</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Your LawlietGPT password has been changed successfully.
          </p>
        </div>
        <div className="space-y-3">
          <Link href="/auth/signin" className="text-blue-600 dark:text-blue-400 hover:underline block text-center">
            Continue to sign in
          </Link>
          <SupportLink />
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Choose a new password</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Use at least 8 characters for your new password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div role="alert" className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Updating password..." : "Update Password"}
        </Button>
        <SupportLink />
      </form>
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null)
  const [tokenResolved, setTokenResolved] = useState(false)

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token")
    setToken(value)
    setTokenResolved(true)
  }, [])

  if (!tokenResolved) {
    return null
  }

  return token ? <CompleteResetForm token={token} /> : <RequestResetForm />
}
