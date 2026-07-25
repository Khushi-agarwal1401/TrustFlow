import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
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
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user) {
          // You could choose to automatically create a user here if signup is desired
          // But typically, a separate signup flow or an explicit signup action is better.
          // The prompt says "sign in or signup portal".
          const hashedPassword = await bcrypt.hash(credentials.password as string, 10)
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email as string,
              passwordHash: hashedPassword,
              name: (credentials.email as string).split("@")[0]
            }
          })
          return newUser
        }

        if (!user.passwordHash) return null

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) return null

        return user
      }
    }),
  ],
  pages: { signIn: "/auth/signin" },
  callbacks: {
    session({ session, user }) {
      if (session.user) session.user.id = user.id
      return session
    },
  },
})
