import { PrismaClient, UserRole } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10)

  const userData = [
    { email: "client@trustflow.ai", name: "Alice Client", roles: [UserRole.CLIENT] },
    { email: "freelancer@trustflow.ai", name: "Bob Freelancer", roles: [UserRole.FREELANCER] },
    { email: "admin@trustflow.ai", name: "Carol Admin", roles: [UserRole.ADMIN] },
  ]

  for (const u of userData) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } })
    if (!existing) {
      await prisma.user.create({ data: { ...u, passwordHash } })
      console.log(`Created user: ${u.email}`)
    }
  }

  const clauseTemplates = [
    { name: "Standard IP Assignment", description: "Client owns all work product", jurisdiction: "US", category: "IP", content: "All work product created under this agreement shall be considered 'work made for hire'..." },
    { name: "NDA (Mutual)", description: "Mutual non-disclosure", jurisdiction: "US", category: "NDA", content: "Neither party shall disclose confidential information obtained from the other party..." },
    { name: "GDPR Data Processing", description: "GDPR-compliant data handling", jurisdiction: "EU", category: "Compliance", content: "The processor shall process personal data only on documented instructions from the controller..." },
    { name: "Late Payment", description: "Late payment penalties", jurisdiction: "US", category: "Payment", content: "Invoices unpaid after 30 days shall accrue interest at 1.5% per month..." },
    { name: "Limitation of Liability", description: "Standard liability cap", jurisdiction: "US", category: "Liability", content: "Neither party's liability shall exceed the total fees paid under this agreement..." },
    { name: "UK Consumer Rights", description: "UK-specific consumer protections", jurisdiction: "UK", category: "Compliance", content: "The Consumer Rights Act 2015 applies to this agreement..." },
  ]

  for (const t of clauseTemplates) {
    const existing = await prisma.clauseTemplate.findFirst({ where: { name: t.name } })
    if (!existing) {
      await prisma.clauseTemplate.create({ data: { ...t, isActive: true } })
      console.log(`Created clause template: ${t.name}`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
