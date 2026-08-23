import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRequestUserId } from "@/lib/mobile-auth"

export async function GET(request: Request) {
  try {
    const userId = await getRequestUserId(request)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    })
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Mobile session validation error:", error)
    return NextResponse.json({ error: "Unable to validate session." }, { status: 500 })
  }
}
