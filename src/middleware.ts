import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import authConfig from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isAuth = !!req.auth
  const authPaths = ["/auth/signin", "/auth/signup", "/auth/reset-password"]
  const isAuthPath = authPaths.some((path) => req.nextUrl.pathname.startsWith(path))

  if (!isAuth && !isAuthPath) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  if (isAuth && isAuthPath) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/",
    "/chat/:path*",
    "/settings/:path*",
    "/auth/signin",
    "/auth/signup",
    "/auth/reset-password",
    "/auth/reset-password/:path*",
  ],
}
