import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await prisma.userSetting.findUnique({
      where: { userId: session.user.id },
    })

    const defaultGeminiModel = process.env.GEMINI_MODEL || "gemini-3.6-flash"
    if (settings && settings.model !== defaultGeminiModel) {
      const normalizedSettings = await prisma.userSetting.update({
        where: { userId: session.user.id },
        data: { model: defaultGeminiModel },
      })
      return NextResponse.json(normalizedSettings)
    }

    return NextResponse.json(settings || {})
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const normalizedData = {
      ...data,
      ...(data.model && String(data.model) !== (process.env.GEMINI_MODEL || "gemini-3.6-flash")
        ? { model: process.env.GEMINI_MODEL || "gemini-3.6-flash" }
        : {}),
    }

    const settings = await prisma.userSetting.upsert({
      where: { userId: session.user.id },
      update: normalizedData,
      create: {
        userId: session.user.id,
        ...normalizedData,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}