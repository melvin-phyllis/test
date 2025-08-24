import { type NextRequest, NextResponse } from "next/server"
import { getSerperAPI } from "@/lib/serper"

export async function POST(request: NextRequest) {
  try {
    const { query, industry, location, limit = 10 } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    console.log("[v0] Searching prospects with query:", { query, industry, location })

    const serper = getSerperAPI()

    // Build enhanced search query
    let searchQuery = query
    if (industry) searchQuery += ` ${industry}`
    if (location) searchQuery += ` ${location}`
    searchQuery += ' site:linkedin.com "CEO" OR "CTO" OR "VP" OR "Director" OR "Manager"'

    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: searchQuery,
        num: limit,
      }),
    })

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`)
    }

    const data = await response.json()

    // Process search results to extract prospect information
    const prospects =
      data.organic?.map((result: any, index: number) => {
        const title = result.title || ""
        const snippet = result.snippet || ""
        const link = result.link || ""

        // Extract name and position from title
        const nameMatch = title.match(/^([^-|]+)/)
        const positionMatch = title.match(/(?:-|–|\|)\s*([^-|]+)/)

        return {
          id: `search-${index}`,
          name: nameMatch ? nameMatch[1].trim() : "Unknown",
          position: positionMatch ? positionMatch[1].trim() : "Unknown Position",
          company: extractCompanyFromSnippet(snippet),
          linkedin: link.includes("linkedin.com") ? link : undefined,
          snippet: snippet.substring(0, 150) + "...",
          score: Math.floor(Math.random() * 30) + 70, // Simulated AI score
          status: "new" as const,
          source: "serper_search",
        }
      }) || []

    console.log("[v0] Found prospects:", prospects.length)

    return NextResponse.json({
      prospects,
      total: prospects.length,
      query: searchQuery,
    })
  } catch (error) {
    console.error("[v0] Error searching prospects:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function extractCompanyFromSnippet(snippet: string): string {
  // Try to extract company name from snippet
  const companyPatterns = [
    /at\s+([A-Z][a-zA-Z\s&]+?)(?:\s|,|\.)/,
    /works?\s+(?:at|for)\s+([A-Z][a-zA-Z\s&]+?)(?:\s|,|\.)/,
    /([A-Z][a-zA-Z\s&]+?)\s+(?:company|corporation|inc|ltd)/i,
  ]

  for (const pattern of companyPatterns) {
    const match = snippet.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return "Unknown Company"
}
