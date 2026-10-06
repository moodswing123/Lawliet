import { getRequestUserId } from "@/lib/mobile-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const userId = await getRequestUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await prisma.userSetting.findUnique({
      where: { userId: userId },
    })

    const defaultGroqModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
    if (settings && settings.model !== defaultGroqModel) {
      const normalizedSettings = await prisma.userSetting.update({
        where: { userId: userId },
        data: { model: defaultGroqModel },
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
    const userId = await getRequestUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const normalizedData = {
      ...data,
      ...(data.model && String(data.model) !== (process.env.GROQ_MODEL || "llama-3.3-70b-versatile")
        ? { model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile" }
        : {}),
    }

    const settings = await prisma.userSetting.upsert({
      where: { userId: userId },
      update: normalizedData,
      create: {
        userId: userId,
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
