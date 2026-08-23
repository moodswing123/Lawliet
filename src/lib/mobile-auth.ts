import { createHmac, timingSafeEqual } from "crypto"
import { auth } from "./auth"

const MOBILE_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30

type MobileTokenPayload = {
  sub: string
  email: string
  name: string | null
  exp: number
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url")
}

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("NEXTAUTH_SECRET is not configured")
  return secret
}

function sign(encodedPayload: string) {
  return createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url")
}

export function createMobileToken(user: {
  id: string
  email: string
  name: string | null
}) {
  const payload: MobileTokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + MOBILE_TOKEN_TTL_SECONDS,
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  return `${encodedPayload}.${sign(encodedPayload)}`
}

export function verifyMobileToken(token: string): MobileTokenPayload | null {
  const [encodedPayload, encodedSignature] = token.split(".")
  if (!encodedPayload || !encodedSignature) return null

  try {
    const expectedSignature = sign(encodedPayload)
    const left = Buffer.from(encodedSignature)
    const right = Buffer.from(expectedSignature)
    if (left.length !== right.length || !timingSafeEqual(left, right)) return null

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as MobileTokenPayload
    if (!payload.sub || !payload.email || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export async function getRequestUserId(request: Request) {
  const authorization = request.headers.get("authorization")
  if (authorization) {
    if (!authorization.startsWith("Bearer ")) return null
    return verifyMobileToken(authorization.slice("Bearer ".length).trim())?.sub ?? null
  }

  const session = await auth()
  return session?.user?.id ?? null
}
