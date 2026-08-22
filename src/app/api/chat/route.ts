import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { streamChatCompletion } from "@/lib/openai"
import { rateLimit } from "@/lib/rate-limit"

const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024

function normalizeAttachments(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return undefined

  return value.map((attachment) => {
    if (!attachment || typeof attachment !== "object") {
      throw new Error("Invalid attachment")
    }

    const item = attachment as Record<string, unknown>
    const name = typeof item.name === "string" ? item.name : ""
    const type = typeof item.type === "string" ? item.type : ""
    const size = typeof item.size === "number" ? item.size : 0
    const dataUrl = typeof item.dataUrl === "string" ? item.dataUrl : ""
    const supportedType = type.startsWith("image/") || [
      "application/pdf",
      "application/json",
      "text/plain",
      "text/csv",
      "text/markdown",
      "application/octet-stream",
    ].includes(type)
    const supportedName = /\.(txt|md|csv|json|pdf)$/i.test(name)

    if (!name || !dataUrl.startsWith("data:") || size <= 0 || size > MAX_ATTACHMENT_BYTES || (!supportedType && !supportedName)) {
      throw new Error(`Invalid or unsupported attachment: ${name || "file"}`)
    }

    return { name, type: type || "application/octet-stream", size, dataUrl }
  })
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limiting
    const limitResult = await rateLimit(session.user.id)
    if (limitResult.limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const { messages, conversationId, model, temperature, maxTokens, attachments } =
      await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      )
    }

    const userMessage = messages[messages.length - 1]
    let userAttachments: ReturnType<typeof normalizeAttachments> = undefined
    try {
      userAttachments = normalizeAttachments(userMessage?.attachments || attachments)
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid attachment" },
        { status: 400 }
      )
    }
    const chatMessages = messages.map((message: any, index: number) =>
      index === messages.length - 1
        ? { ...message, attachments: userAttachments }
        : message
    )

    // Validate ownership if conversation exists
    if (conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: session.user.id,
        },
      })
      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found or unauthorized" },
          { status: 404 }
        )
      }
    }

    // Get user settings
    const settings = await prisma.userSetting.findUnique({
      where: { userId: session.user.id },
    })

    const defaultGeminiModel = process.env.GEMINI_MODEL || "gemini-3.6-flash"
    const requestedModel = model || settings?.model
    const modelToUse = requestedModel === defaultGeminiModel ? requestedModel : defaultGeminiModel
    const temp = temperature ?? settings?.temperature ?? 0.7
    const tokens = maxTokens ?? settings?.maxTokens ?? 4096

    // Save user message to DB
    let convId = conversationId
    if (!convId) {
      const newConversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title: messages[0]?.content?.slice(0, 50) || "New Conversation",
        },
      })
      convId = newConversation.id
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: convId,
        role: "user",
        content: userMessage.content,
        ...(userAttachments?.length ? { attachments: userAttachments } : {}),
      },
    })

    // Stream response
    const stream = await streamChatCompletion(
              chatMessages,
        modelToUse,

      temp,
      tokens
    )

    // Create stream response
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullContent = ""
        try {
          for await (const chunk of stream) {
            const content = chunk
            if (content) {
              fullContent += content
              const data = JSON.stringify({ content, done: false })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Save assistant message to DB
          await prisma.message.create({
            data: {
              conversationId: convId,
              role: "assistant",
              content: fullContent,
            },
          })

          // Update conversation title if it's the first message
          const messageCount = await prisma.message.count({
            where: { conversationId: convId },
          })
          if (messageCount === 2) {
            const title =
              fullContent.slice(0, 50) || messages[0]?.content?.slice(0, 30)
            await prisma.conversation.update({
              where: { id: convId },
              data: {
                title: title + (fullContent.length > 50 ? "..." : ""),
              },
            })
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, conversationId: convId })}\n\n`
            )
          )
          controller.close()
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Streaming error"
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: errorMessage, done: true })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}