import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lawliet - AI Chat",
  description: "Intelligent conversations with Lawliet AI",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <div
            aria-label="Victory Tech trademark watermark"
            className="pointer-events-none fixed bottom-2 right-3 z-[100] select-none text-[10px] font-medium tracking-wide text-gray-400/70 dark:text-gray-500/70"
          >
            Victory Tech™
          </div>
        </Providers>
      </body>
    </html>
  )
}