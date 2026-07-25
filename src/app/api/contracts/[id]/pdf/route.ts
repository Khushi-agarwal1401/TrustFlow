import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      project: true,
      signatures: { include: { user: true } },
    },
  })

  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const project = contract.project
  if (project.clientId !== user!.id && project.freelancerId !== user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const html = generateContractHtml(contract)

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `inline; filename="contract-${id}.html"`,
    },
  })
}

function generateContractHtml(contract: {
  id: string
  aiGeneratedDraft: unknown
  finalTerms: unknown
  project: { title: string; totalAmount: number; description: string }
  signatures: { user: { name: string }; signedAt: Date }[]
}) {
  const draft = contract.aiGeneratedDraft as { terms?: string; milestones?: { title: string; amount: number }[] } | null
  const terms = contract.finalTerms || draft

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${contract.project.title} - Contract</title>
<style>
body { font-family: 'Inter', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a2e; }
h1 { font-size: 24px; border-bottom: 2px solid #6C63FF; padding-bottom: 8px; }
h2 { font-size: 18px; margin-top: 24px; }
table { width: 100%; border-collapse: collapse; margin: 16px 0; }
th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
th { background: #f5f5ff; }
.signature-block { margin-top: 40px; border-top: 2px solid #6C63FF; padding-top: 20px; }
.signature { margin: 16px 0; padding: 12px; background: #f9f9ff; border-radius: 8px; }
</style></head><body>
<h1>${contract.project.title}</h1>
<p><strong>Total Amount:</strong> $${(contract.project.totalAmount / 100).toLocaleString()}</p>
<p>${contract.project.description}</p>
${terms && typeof terms === "object" ? `
<h2>Terms & Milestones</h2>
<p>${(terms as { terms?: string }).terms || ""}</p>
${(terms as { milestones?: { title: string; amount: number }[] }).milestones ? `
<table><tr><th>#</th><th>Milestone</th><th>Amount</th></tr>
${(terms as { milestones: { title: string; amount: number }[] }).milestones.map((m: { title: string; amount: number }, i: number) => `
<tr><td>${i + 1}</td><td>${m.title}</td><td>$${(m.amount / 100).toLocaleString()}</td></tr>`).join("")}
</table>` : ""}` : ""}
<div class="signature-block">
<h2>Signatures</h2>
${contract.signatures.length === 0 ? "<p>No signatures yet</p>" : contract.signatures.map((s) => `
<div class="signature"><strong>${s.user.name}</strong><br><span style="color: #666;">Signed: ${new Date(s.signedAt).toLocaleDateString()}</span></div>`).join("")}
</div>
<p style="margin-top: 40px; font-size: 12px; color: #999;">TrustFlow AI · ${new Date().toISOString().split("T")[0]}</p>
</body></html>`
}
