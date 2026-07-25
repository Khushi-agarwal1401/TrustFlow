import { PrismaClient, UserRole } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10)

  const client = await prisma.user.upsert({
    where: { email: "client@trustflow.ai" },
    update: {},
    create: {
      email: "client@trustflow.ai",
      name: "Alice Client",
      passwordHash,
      roles: [UserRole.CLIENT],
    },
  })

  const freelancer = await prisma.user.upsert({
    where: { email: "freelancer@trustflow.ai" },
    update: {},
    create: {
      email: "freelancer@trustflow.ai",
      name: "Bob Freelancer",
      passwordHash,
      roles: [UserRole.FREELANCER],
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: "admin@trustflow.ai" },
    update: {},
    create: {
      email: "admin@trustflow.ai",
      name: "Carol Admin",
      passwordHash,
      roles: [UserRole.ADMIN],
    },
  })

  console.log("Seeded users:", { client: client.email, freelancer: freelancer.email, admin: admin.email })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
