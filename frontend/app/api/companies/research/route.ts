import { type NextRequest, NextResponse } from "next/server"
import { getSerperAPI } from "@/lib/serper"

export async function POST(request: NextRequest) {
  try {
    const { company, includeNews = true, includeTrends = true } = await request.json()

    if (!company) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 })
    }

    console.log("[v0] Researching company:", company)

    const serper = getSerperAPI()

    // Get basic company information
    const companyInfo = await serper.searchCompany(company)

    let news: string[] = []
    let trends: string[] = []

    // Get recent news if requested
    if (includeNews) {
      try {
        const newsResponse = await fetch("https://google.serper.dev/news", {
          method: "POST",
          headers: {
            "X-API-KEY": process.env.SERPER_API_KEY!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: `"${company}" news`,
            num: 5,
          }),
        })

        if (newsResponse.ok) {
          const newsData = await newsResponse.json()
          news =
            newsData.news?.map((item: any) => ({
              title: item.title,
              snippet: item.snippet,
              link: item.link,
              date: item.date,
            })) || []
        }
      } catch (error) {
        console.error("[v0] Error fetching news:", error)
      }
    }

    // Get industry trends if requested
    if (includeTrends && companyInfo?.industry) {
      trends = await serper.searchIndustryTrends(companyInfo.industry)
    }

    const research = {
      company: companyInfo,
      news,
      trends,
      insights: [
        ...(companyInfo?.description ? [`Company Overview: ${companyInfo.description}`] : []),
        ...trends.slice(0, 2),
        ...news.slice(0, 2).map((item: any) => `Recent News: ${item.title}`),
      ].slice(0, 5),
    }

    console.log("[v0] Company research completed for:", company)

    return NextResponse.json(research)
  } catch (error) {
    console.error("[v0] Error researching company:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
