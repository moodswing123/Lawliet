import { NextResponse } from "next/server"
import { createHash, randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/email"

const TOKEN_TTL_MS = 30 * 60 * 1000
const REQUEST_WINDOW_MS = 15 * 60 * 1000
const REQUEST_LIMIT = 5

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : ""
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

function genericSuccess() {
  return NextResponse.json({
    message: "If an account exists for that email, reset instructions have been sent.",
  })
}

export async function POST(request: Request) {
  try {
    if (!isEmailConfigured()) {
      console.error("Password reset requested while Gmail delivery is not configured")
      return NextResponse.json(
        { error: "Password reset email is temporarily unavailable. Please contact support." },
        { status: 503 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const email = normalizeEmail(body.email)

    if (!email || !email.includes("@") || email.length > 254) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
    }

    const recentRequests = await prisma.passwordResetToken.count({
      where: {
        createdAt: { gte: new Date(Date.now() - REQUEST_WINDOW_MS) },
        user: { email },
      },
    })

    if (recentRequests >= REQUEST_LIMIT) {
      return NextResponse.json(
        { error: "Too many reset requests. Please wait a few minutes and try again." },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.password) {
      return genericSuccess()
    }

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        OR: [{ usedAt: { not: null } }, { expiresAt: { lt: new Date() } }],
      },
    })

    const token = randomBytes(32).toString("base64url")
    await prisma.passwordResetToken.create({
      data: {
        tokenHash: hashToken(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    })

    try {
      await sendPasswordResetEmail({ email: user.email, name: user.name, token })
    } catch (error) {
      await prisma.passwordResetToken.deleteMany({ where: { tokenHash: hashToken(token) } })
      throw error
    }

    return genericSuccess()
  } catch (error) {
    console.error("Password reset request error:", error)
    return NextResponse.json(
      { error: "We could not send the reset email right now. Please try again later." },
      { status: 500 }
    )
  }
}
