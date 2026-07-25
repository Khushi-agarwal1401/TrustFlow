import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function MessagesPage({
  searchParams
}: {
  searchParams: { projectId?: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) redirect("/auth/signin")

  // Fetch all projects for the user including messages
  const projects = await prisma.project.findMany({
    where: { OR: [{ clientId: session.user.id }, { freelancerId: session.user.id }] },
    include: {
      client: true,
      freelancer: true,
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  // Determine selected project
  const selectedProjectId = searchParams.projectId || (projects.length > 0 ? projects[0].id : null)
  const selectedProject = projects.find(p => p.id === selectedProjectId)

  // Identify recipient for selected project
  let selectedRecipient = null;
  if (selectedProject) {
    selectedRecipient = selectedProject.clientId === user.id ? selectedProject.freelancer : selectedProject.client
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* LEFT SIDEBAR */}
      <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col justify-between hidden lg:flex shrink-0 h-screen overflow-y-auto">
        <div>
          <div className="h-[72px] flex items-center px-6 border-b border-transparent">
            <div className="flex items-center gap-2.5 text-[#4F46E5]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <span className="font-bold text-xl tracking-tight text-[#0F172A]">TrustFlow</span>
            </div>
          </div>
          <nav className="px-4 py-6 flex flex-col gap-1">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
              Dashboard
            </Link>
            <Link href="/projects" className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <div className="w-[18px] h-[18px] bg-gray-300 rounded-sm opacity-50"></div>
              Projects
            </Link>
            <Link href="/contracts" className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <div className="w-[18px] h-[18px] bg-gray-300 rounded-sm opacity-50"></div>
              Contracts
            </Link>
            <Link href="/milestones" className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <div className="w-[18px] h-[18px] bg-gray-300 rounded-sm opacity-50"></div>
              Milestones
            </Link>
            <Link href="/escrow-payments" className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <div className="w-[18px] h-[18px] bg-gray-300 rounded-sm opacity-50"></div>
              Escrow & Payments
            </Link>
            <Link href="/disputes" className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <div className="w-[18px] h-[18px] bg-gray-300 rounded-sm opacity-50"></div>
              Disputes
            </Link>
            <Link href="/freelancers" className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <div className="w-[18px] h-[18px] bg-gray-300 rounded-sm opacity-50"></div>
              Freelancers
            </Link>
            <Link href="/messages" className="flex items-center gap-3 px-3 py-2.5 bg-[#EEF2FF] text-[#4F46E5] font-medium rounded-lg transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              Messages
              <span className="ml-auto bg-[#4F46E5] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
            </Link>
            {['Analytics', 'Reports', 'Settings'].map(item => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
                <div className="w-[18px] h-[18px] bg-gray-300 rounded-sm opacity-50"></div>
                {item}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4">
          <div className="bg-[#EEF2FF] rounded-xl p-5 mb-4 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5 mb-1">
                <svg width="14" height="14" fill="currentColor" className="text-[#4F46E5]" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Upgrade to Pro
              </h4>
              <p className="text-[11px] text-[#64748B] mb-3 leading-relaxed">Unlock advanced analytics, priority support and more.</p>
              <button className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold py-2 rounded-lg transition-colors shadow-sm">Upgrade Now</button>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden shrink-0">
               {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] truncate">{user.name}</p>
              <p className="text-xs text-[#64748B] capitalize">{user.roles?.[0]?.toLowerCase() || "Client"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN WRAPPER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex-1 max-w-xl relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" placeholder="Search projects, freelancers, invoices..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all" />
          </div>
          <div className="flex items-center gap-5 pl-4">
            <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">5</span>
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                 {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
              </div>
              <span className="text-sm font-semibold text-[#0F172A] hidden md:block">{user.name?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* MESSAGES LAYOUT */}
        <div className="flex-1 overflow-hidden flex flex-col p-8 pb-0">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-6 shrink-0">
            <div>
              <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight mb-1">Messages</h1>
              <p className="text-sm text-[#64748B]">Communicate securely with your freelancers and team members.</p>
            </div>
          </div>

          <div className="flex-1 flex gap-6 min-h-0 pb-8">
            
            {/* COLUMN 1: INBOX LIST */}
            <div className="w-[300px] xl:w-[320px] shrink-0 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex flex-col gap-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    <input type="text" placeholder="Search messages..." className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all" />
                  </div>
                  <button className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                  </button>
                </div>
                <div className="flex gap-4 text-[13px] font-bold px-2">
                  <button className="text-[#4F46E5] border-b-2 border-[#4F46E5] pb-2">All</button>
                  <button className="text-[#64748B] hover:text-[#0F172A] pb-2 flex items-center gap-1.5">Unread <span className="bg-[#EEF2FF] text-[#4F46E5] text-[10px] px-1.5 py-0.5 rounded-full">3</span></button>
                  <button className="text-[#64748B] hover:text-[#0F172A] pb-2">Archived</button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {projects.length > 0 ? projects.map((p) => {
                  const recipient = p.clientId === user.id ? p.freelancer : p.client
                  const lastMessage = p.messages[p.messages.length - 1]
                  const isActive = selectedProject?.id === p.id
                  const unreadCount = 0; // Mocked for UI

                  return (
                    <Link key={p.id} href={`/messages?projectId=${p.id}`} className={`block p-4 hover:bg-gray-50 transition-colors ${isActive ? 'bg-[#F8FAFC]' : ''}`}>
                      <div className="flex gap-3 relative">
                        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 relative overflow-hidden">
                          {recipient?.avatarUrl ? <img src={recipient.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
                          {/* Online status indicator */}
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10B981] border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className={`text-[13px] font-bold truncate ${isActive ? 'text-[#0F172A]' : 'text-[#0F172A]'}`}>{recipient?.name || 'Unknown User'}</span>
                            <span className={`text-[10px] shrink-0 ${unreadCount > 0 ? 'text-[#4F46E5] font-bold' : 'text-[#94A3B8]'}`}>
                              {lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#64748B] truncate mb-1">Project: {p.title}</div>
                          <div className="flex justify-between items-center">
                            <span className={`text-[12px] truncate ${unreadCount > 0 ? 'font-bold text-[#0F172A]' : 'text-[#64748B]'}`}>
                              {lastMessage ? (lastMessage.type === 'FILE' ? 'Sent a file' : lastMessage.content) : 'No messages yet'}
                            </span>
                            {unreadCount > 0 && (
                              <div className="w-4 h-4 bg-[#4F46E5] text-white rounded-full flex items-center justify-center text-[9px] font-bold shrink-0">{unreadCount}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                }) : (
                  <div className="p-8 text-center text-sm text-gray-500 font-medium">No conversations found.</div>
                )}
              </div>
            </div>

            {/* COLUMN 2: CHAT WINDOW */}
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden">
              {selectedProject ? (
                <>
                  {/* Chat Header */}
                  <div className="h-[72px] border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden shrink-0">
                        {selectedRecipient?.avatarUrl ? <img src={selectedRecipient.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-[#0F172A]">{selectedRecipient?.name || 'User'}</div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                          <span className="text-[#64748B]">Online</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-[#64748B]">Working on <span className="text-[#4F46E5] font-bold cursor-pointer">{selectedProject.title}</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></button>
                      <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg></button>
                      <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></button>
                    </div>
                  </div>

                  {/* Chat Bubbles Area */}
                  <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA] flex flex-col gap-6">
                    
                    <div className="flex items-center justify-center">
                      <div className="bg-white border border-gray-200 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">Today</div>
                    </div>

                    {selectedProject.messages.length > 0 ? selectedProject.messages.map((msg, i) => {
                      const isMe = msg.senderId === user.id;

                      if (msg.type === 'SYSTEM') {
                        return (
                           <div key={msg.id} className="flex flex-col items-center justify-center my-2">
                              <div className="bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-bold px-4 py-2 rounded-lg border border-[#C7D2FE]">
                                {msg.content}
                              </div>
                           </div>
                        )
                      }

                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${isMe ? 'bg-[#4F46E5] text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-[#0F172A] rounded-tl-sm shadow-sm'}`}>
                            {msg.type === 'FILE' && msg.fileUrl ? (
                               <a href={msg.fileUrl} target="_blank" className={`flex items-center gap-2 mb-2 p-2 rounded border ${isMe ? 'bg-[#4338CA] border-[#3730A3] hover:bg-[#3730A3]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                                  <span className="text-[12px] font-bold underline">Attachment</span>
                               </a>
                            ) : null}
                            <p className="text-[13px] leading-relaxed break-words">{msg.content}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1.5 text-[10px] text-[#94A3B8] font-medium ${isMe ? 'flex-row-reverse' : ''}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && (
                              <svg width="12" height="12" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                            )}
                          </div>
                        </div>
                      )
                    }) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                         <svg className="mb-3 opacity-50" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                         <p className="text-sm font-medium">Send a message to start the conversation</p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                    <div className="border border-gray-200 rounded-xl bg-[#F8FAFC] flex flex-col focus-within:ring-2 focus-within:ring-[#4F46E5]/20 focus-within:border-[#4F46E5] transition-all">
                      <textarea 
                        className="w-full bg-transparent resize-none p-4 pb-2 text-[13px] text-[#0F172A] focus:outline-none placeholder-gray-400" 
                        rows={1} 
                        placeholder="Type a message..."
                      ></textarea>
                      <div className="flex items-center justify-between px-3 pb-3">
                        <div className="flex items-center gap-1">
                          <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                          </button>
                          <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          </button>
                          <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          </button>
                        </div>
                        <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors">
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <p className="text-sm">Select a conversation to start messaging</p>
                </div>
              )}
            </div>

            {/* COLUMN 3: DETAILS & FILES */}
            <div className="w-[280px] xl:w-[300px] shrink-0 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-y-auto">
              {selectedProject && (
                <div className="divide-y divide-gray-100">
                  
                  {/* Conversation Details */}
                  <div className="p-6 pb-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[13px] font-bold text-[#0F172A]">Conversation Details</h3>
                      <button className="text-gray-400 hover:text-gray-600"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg></button>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0 relative overflow-hidden">
                        {selectedRecipient?.avatarUrl ? <img src={selectedRecipient.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[14px] font-bold text-[#0F172A] truncate mb-0.5">{selectedRecipient?.name || 'User'}</div>
                        <div className="text-[11px] text-[#64748B] truncate mb-0.5">{selectedRecipient?.email}</div>
                        <div className="text-[11px] text-[#94A3B8] font-medium capitalize">{selectedRecipient?.roles?.[0]?.toLowerCase() || 'Freelancer'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-6 py-5">
                    <h3 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-3">Project</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <svg className="text-gray-400 shrink-0" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                        <span className="text-[13px] font-bold text-[#0F172A] truncate">{selectedProject.title}</span>
                      </div>
                      <button className="px-3 py-1 border border-gray-200 rounded-md text-[10px] font-bold text-[#0F172A] hover:bg-gray-50 whitespace-nowrap shrink-0">View Project</button>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="p-6 py-5">
                    <h3 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-4">Participants (2)</h3>
                    <div className="flex flex-col gap-4">
                      {/* Current User */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 relative overflow-hidden">
                          {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-[#0F172A]">{user.name} <span className="text-[#64748B] font-medium">(You)</span></div>
                          <div className="text-[11px] text-[#94A3B8] capitalize">{user.roles?.[0]?.toLowerCase() || 'Client'}</div>
                        </div>
                      </div>
                      {/* Recipient */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 relative overflow-hidden">
                          {selectedRecipient?.avatarUrl ? <img src={selectedRecipient.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10B981] border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-[#0F172A]">{selectedRecipient?.name || 'User'}</div>
                          <div className="text-[11px] text-[#94A3B8] capitalize">{selectedRecipient?.roles?.[0]?.toLowerCase() || 'Freelancer'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shared Files */}
                  <div className="p-6 py-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Shared Files</h3>
                      <button className="text-[11px] font-bold text-[#4F46E5] hover:underline">View all</button>
                    </div>
                    <div className="flex flex-col gap-4">
                      {selectedProject.messages.filter(m => m.type === 'FILE' || m.fileUrl).slice(0, 3).map((fileMsg, i) => (
                        <div key={i} className="flex gap-3 items-center group cursor-pointer">
                          <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0 group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[12px] font-bold text-[#0F172A] truncate group-hover:text-[#4F46E5] transition-colors">Shared_File.pdf</div>
                            <div className="text-[10px] text-[#94A3B8]">PDF • 1.2 MB</div>
                          </div>
                          <div className="text-[10px] text-[#94A3B8] shrink-0">{new Date(fileMsg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                        </div>
                      ))}
                      {selectedProject.messages.filter(m => m.type === 'FILE' || m.fileUrl).length === 0 && (
                        <div className="text-[11px] text-gray-500 italic">No files shared yet.</div>
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="p-6 py-5">
                    <h3 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-4">Options</h3>
                    <div className="flex flex-col gap-3 text-[12px] font-bold text-[#0F172A]">
                      <button className="flex items-center gap-3 hover:text-[#4F46E5] transition-colors w-full text-left">
                        <svg className="text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        Search in conversation
                      </button>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <svg className="text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                          Mute notifications
                        </div>
                        <div className="w-7 h-4 bg-gray-200 rounded-full relative cursor-pointer"><div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div></div>
                      </div>
                      <button className="flex items-center gap-3 text-[#EF4444] hover:text-[#DC2626] transition-colors w-full text-left">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                        Archive conversation
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
