import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { MessageSquare, ArrowRight, Clock, User as UserIcon } from "lucide-react"

export default async function MessagesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  // Fetch projects with their latest message
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { clientId: session.user.id },
        { freelancerId: session.user.id }
      ]
    },
    include: {
      client: { select: { id: true, name: true, avatarUrl: true } },
      freelancer: { select: { id: true, name: true, avatarUrl: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, name: true } } }
      }
    },
    orderBy: { updatedAt: "desc" }
  })

  // Filter to projects that actually have messages, or just show all active projects as "conversations"
  const conversations = projects.filter(p => p.messages.length > 0 || p.status !== "DRAFT")

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 font-sans">
      <header className="bg-white border border-gray-200 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition">&larr; Dashboard</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-bold text-gray-900">Messages</h1>
        </div>
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-[#4F46E5]" />
          <span className="text-sm font-semibold text-gray-600">Inbox</span>
        </div>
      </header>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {conversations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No conversations found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((project) => {
              const isClient = project.clientId === session.user.id
              const counterparty = isClient ? project.freelancer : project.client
              const latestMessage = project.messages[0]

              return (
                <Link 
                  href={`/projects/${project.id}`} 
                  key={project.id}
                  className="block p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {counterparty?.avatarUrl ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={counterparty.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full shrink-0 bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center border border-[#E0E7FF]">
                        <UserIcon className="w-5 h-5" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-900 truncate pr-4">
                          {counterparty?.name || "Pending Invite"}
                        </h3>
                        {latestMessage && (
                          <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0 whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            {new Date(latestMessage.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-[#4F46E5] mb-1.5 truncate">
                        Project: {project.title}
                      </p>
                      
                      {latestMessage ? (
                        <p className={`text-sm line-clamp-2 ${latestMessage.readAt || latestMessage.senderId === session.user.id ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                          {latestMessage.senderId === session.user.id && <span className="text-gray-400">You: </span>}
                          {latestMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No messages yet. Say hello!</p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end justify-center shrink-0 h-12">
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
