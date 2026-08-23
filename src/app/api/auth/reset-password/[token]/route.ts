import { NextResponse } from "next/server"
import { createHash } from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendPasswordChangedEmail } from "@/lib/email"

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export async function POST(
  request: Request,
  context: { params: { token: string } }
) {
  try {
    const token = context.params.token?.trim()
    if (!token) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const password = typeof body.password === "string" ? body.password : ""

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      )
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
    })

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() <= Date.now()
    ) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: resetToken.userId },
      select: { email: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
          id: { not: resetToken.id },
        },
      }),
    ])

    try {
      await sendPasswordChangedEmail({ email: user.email, name: user.name })
    } catch (emailError) {
      console.error("Password changed email delivery error:", emailError)
    }

    return NextResponse.json({ message: "Password updated successfully." })
  } catch (error) {
    console.error("Password reset completion error:", error)
    return NextResponse.json(
      { error: "We could not update your password. Please request a new reset link." },
      { status: 500 }
    )
  }
}
