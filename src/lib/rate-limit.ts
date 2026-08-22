import { prisma } from "./prisma"

interface RateLimitResult {
  limited: boolean
  remaining: number
  resetTime: number
}

export async function rateLimit(
  userId: string,
  maxRequests: number = parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100"
  ),
  windowMs: number = parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || "60000"
  )
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStart = now - windowMs

  const messages = await prisma.message.findMany({
    where: {
      conversation: {
        userId,
      },
      createdAt: {
        gte: new Date(windowStart),
      },
    },
  })

  const count = messages.length

  if (count >= maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetTime: now + windowMs,
    }
  }

  return {
    limited: false,
    remaining: maxRequests - count - 1,
    resetTime: now + windowMs,
  }
}