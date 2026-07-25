import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import "./auth-types"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Resend({ from: process.env.AUTH_EMAIL_FROM ?? "noreply@trustflow.ai" }),
  ],
  pages: { signIn: "/auth/signin" },
  callbacks: {
    session({ session, user }) {
      if (session.user) session.user.id = user.id
      return session
    },
  },
})
