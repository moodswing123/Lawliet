import { getRequestUserId } from "@/lib/mobile-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const allowedFeedback = new Set(["positive", "negative"])

export async function PATCH(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const userId = await getRequestUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { feedback } = await req.json()
    if (!allowedFeedback.has(feedback)) {
      return NextResponse.json({ error: "Invalid feedback" }, { status: 400 })
    }

    const message = await prisma.message.findFirst({
      where: {
        id: params.messageId,
        conversation: { userId },
      },
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    const updated = await prisma.message.update({
      where: { id: params.messageId },
      data: { feedback },
    })

    return NextResponse.json({ id: updated.id, feedback: updated.feedback })
  } catch (error) {
    console.error("Feedback error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
