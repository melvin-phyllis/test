import { type NextRequest, NextResponse } from "next/server"
import { getSerperAPI } from "@/lib/serper"

export async function POST(request: NextRequest) {
  try {
    const { name, company } = await request.json()

    if (!name || !company) {
      return NextResponse.json({ error: "Name and company are required" }, { status: 400 })
    }

    console.log("[v0] Enriching prospect:", { name, company })

    const serper = getSerperAPI()
    const enrichment = await serper.searchProspect(name, company)

    if (!enrichment) {
      return NextResponse.json({ error: "Failed to enrich prospect data" }, { status: 500 })
    }

    console.log("[v0] Prospect enrichment completed:", enrichment)

    return NextResponse.json(enrichment)
  } catch (error) {
    console.error("[v0] Error enriching prospect:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
