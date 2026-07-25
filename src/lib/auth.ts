import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import "./auth-types"

const baseAdapter = PrismaAdapter(prisma)

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: {
    ...baseAdapter,
    createUser: (data: any) => {
      const { image, emailVerified, ...rest } = data
      return baseAdapter.createUser!({ ...rest, avatarUrl: image }) as any
    },
    getUser: async (id: string) => {
      const user = await baseAdapter.getUser!(id)
      if (user) (user as any).image = (user as any).avatarUrl
      return user
    },
    getUserByEmail: async (email: string) => {
      const user = await baseAdapter.getUserByEmail!(email)
      if (user) (user as any).image = (user as any).avatarUrl
      return user
    },
    getUserByAccount: async (provider_providerAccountId: { provider: string; providerAccountId: string }) => {
      const user = await baseAdapter.getUserByAccount!(provider_providerAccountId)
      if (user) (user as any).image = (user as any).avatarUrl
      return user
    },
    updateUser: (data: any) => {
      const { image, emailVerified, ...rest } = data
      return baseAdapter.updateUser!({ ...rest, ...(image && { avatarUrl: image }) }) as any
    },
  },
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
      if (session.user) {
        session.user.id = user.id
        ;(session.user as any).image = (user as any).avatarUrl || (user as any).image
      }
      return session
    },
  },
})
