import type { NextAuthConfig } from "next-auth"

const authConfig = {
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isAuth = !!auth
      const authPaths = ["/auth/signin", "/auth/signup", "/auth/reset-password"]
      const isAuthPath = authPaths.some((path) => request.nextUrl.pathname.startsWith(path))
      return isAuth || isAuthPath
    },
  },
  providers: [],
} satisfies NextAuthConfig

export default authConfig
