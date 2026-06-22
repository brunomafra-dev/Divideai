import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import "../lib/fonts"
import { AppProviders } from "@/components/AppProviders"
import WebAnalytics from "@/components/web-analytics"
import WebAdSense from "@/components/web-adsense"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "SplitMate - Divida gastos com facilidade",
  description: "Organize e divida gastos entre amigos, casais e grupos.",
  applicationName: "SplitMate",
  manifest: "/manifest.webmanifest",
  keywords: ["dividir contas", "dividir despesas", "dividir gastos", "split bill", "controle de gastos em grupo"],
  icons: {
    icon: [
      { url: "/logo/splitmate-icon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/logo/splitmate-icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/logo/splitmate-icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/logo/splitmate-apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/logo/splitmate-icon-48.png"],
  },
}

export const viewport: Viewport = {
  themeColor: "#16A34A",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WebAnalytics />
        <WebAdSense />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}


