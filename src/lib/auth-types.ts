import { DefaultSession } from "next-auth"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: { id: string; roles?: UserRole[] } & DefaultSession["user"]
  }
}
