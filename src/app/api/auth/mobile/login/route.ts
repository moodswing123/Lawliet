import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createMobileToken } from "@/lib/mobile-auth"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
    }

    const safeUser = { id: user.id, email: user.email, name: user.name }
    return NextResponse.json({ user: safeUser, token: createMobileToken(safeUser) })
  } catch (error) {
    console.error("Mobile login error:", error)
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 })
  }
}
