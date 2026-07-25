import type { Metadata } from "next"
import { Poppins, Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "TrustFlow AI",
  description: "AI-powered accountability for freelance projects",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
