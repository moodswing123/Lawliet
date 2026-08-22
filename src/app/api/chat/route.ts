import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { streamChatCompletion } from "@/lib/openai"
import { rateLimit } from "@/lib/rate-limit"

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

    const { messages, conversationId, model, temperature, maxTokens } =
      await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      )
    }

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

    const modelToUse = model || settings?.model || process.env.OPENAI_MODEL
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
    const userMessage = messages[messages.length - 1]
    await prisma.message.create({
      data: {
        conversationId: convId,
        role: "user",
        content: userMessage.content,
      },
    })

    // Stream response
    const stream = await streamChatCompletion(
      messages,
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
            const content = chunk.choices[0]?.delta?.content || ""
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