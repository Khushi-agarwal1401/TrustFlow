import { ReactNode } from "react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

export async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) redirect("/auth/signin")

  return (
    <div className="flex h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-sans overflow-hidden">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
