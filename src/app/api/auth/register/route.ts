import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { isEmailConfigured, sendWelcomeEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const { email: rawEmail, password, name } = await req.json()
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : ""

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
        settings: {
          create: {},
        },
      },
    })

    if (isEmailConfigured()) {
      try {
        await sendWelcomeEmail({ email: user.email, name: user.name })
      } catch (emailError) {
        console.error("Welcome email delivery error:", emailError)
      }
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}