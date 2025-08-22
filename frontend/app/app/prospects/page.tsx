"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Download, Filter, Search, Mail, ExternalLink, Eye, ChevronDown, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Prospect {
  id: string
  company: string
  logo: string
  country: { flag: string; name: string }
  sector: string
  contact: { name: string; position: string }
  email: string
  linkedin: string
  qualityScore: number
  status: "new" | "contacted" | "qualified" | "converted"
}

const prospects: Prospect[] = [
  {
    id: "1",
    company: "BMW Group",
    logo: "🏢",
    country: { flag: "🇩🇪", name: "Germany" },
    sector: "Automotive",
    contact: { name: "Klaus Mueller", position: "Head of Digital Innovation" },
    email: "k.mueller@bmw.com",
    linkedin: "https://linkedin.com/in/klaus-mueller",
    qualityScore: 9.2,
    status: "new",
  },
  {
    id: "2",
    company: "Schneider Electric",
    logo: "🏢",
    country: { flag: "🇫🇷", name: "France" },
    sector: "Industry 4.0",
    contact: { name: "Marie Dubois", position: "VP Technology" },
    email: "m.dubois@schneider-electric.com",
    linkedin: "https://linkedin.com/in/marie-dubois",
    qualityScore: 8.8,
    status: "contacted",
  },
  {
    id: "3",
    company: "Shopify",
    logo: "🏢",
    country: { flag: "🇨🇦", name: "Canada" },
    sector: "E-commerce",
    contact: { name: "Sarah Chen", position: "Director of Partnerships" },
    email: "s.chen@shopify.com",
    linkedin: "https://linkedin.com/in/sarah-chen",
    qualityScore: 9.5,
    status: "qualified",
  },
  {
    id: "4",
    company: "Revolut",
    logo: "🏢",
    country: { flag: "🇬🇧", name: "United Kingdom" },
    sector: "FinTech",
    contact: { name: "James Wilson", position: "Head of Business Development" },
    email: "j.wilson@revolut.com",
    linkedin: "https://linkedin.com/in/james-wilson",
    qualityScore: 8.9,
    status: "new",
  },
  {
    id: "5",
    company: "Telefonica",
    logo: "🏢",
    country: { flag: "🇪🇸", name: "Spain" },
    sector: "Technology",
    contact: { name: "Carlos Rodriguez", position: "Innovation Manager" },
    email: "c.rodriguez@telefonica.com",
    linkedin: "https://linkedin.com/in/carlos-rodriguez",
    qualityScore: 8.1,
    status: "contacted",
  },
]

export default function ProspectsPage() {
  const [selectedProspects, setSelectedProspects] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [countryFilter, setCountryFilter] = useState<string>("all")
  const [sectorFilter, setSectorFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            New
          </Badge>
        )
      case "contacted":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            Contacted
          </Badge>
        )
      case "qualified":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Qualified
          </Badge>
        )
      case "converted":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            Converted
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 9) return "text-green-600"
    if (score >= 7) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredProspects = prospects.filter((prospect) => {
    const matchesSearch =
      prospect.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prospect.contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCountry = countryFilter === "all" || prospect.country.name === countryFilter
    const matchesSector = sectorFilter === "all" || prospect.sector === sectorFilter
    const matchesStatus = statusFilter === "all" || prospect.status === statusFilter

    return matchesSearch && matchesCountry && matchesSector && matchesStatus
  })

  const toggleProspectSelection = (prospectId: string) => {
    setSelectedProspects((prev) =>
      prev.includes(prospectId) ? prev.filter((id) => id !== prospectId) : [...prev, prospectId],
    )
  }

  const toggleSelectAll = () => {
    setSelectedProspects(
      selectedProspects.length === filteredProspects.length ? [] : filteredProspects.map((p) => p.id),
    )
  }

  const clearFilters = () => {
    setCountryFilter("all")
    setSectorFilter("all")
    setStatusFilter("all")
    setSearchQuery("")
  }

  const uniqueCountries = Array.from(new Set(prospects.map((p) => p.country.name)))
  const uniqueSectors = Array.from(new Set(prospects.map((p) => p.sector)))
  const uniqueStatuses = Array.from(new Set(prospects.map((p) => p.status)))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prospects</h1>
          <p className="text-muted-foreground">{filteredProspects.length} prospects found worldwide</p>
        </div>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {selectedProspects.length > 0 && <Button>Bulk Actions ({selectedProspects.length})</Button>}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {(countryFilter !== "all" || sectorFilter !== "all" || statusFilter !== "all" || searchQuery) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies or contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {uniqueCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {uniqueSectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prospects Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProspects.length === filteredProspects.length && filteredProspects.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProspects.map((prospect) => (
                <TableRow key={prospect.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedProspects.includes(prospect.id)}
                      onCheckedChange={() => toggleProspectSelection(prospect.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{prospect.logo}</span>
                      <span className="font-medium">{prospect.company}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{prospect.country.flag}</span>
                      <span className="text-sm">{prospect.country.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{prospect.sector}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{prospect.contact.name}</p>
                      <p className="text-xs text-muted-foreground">{prospect.contact.position}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-12">
                        <Progress value={prospect.qualityScore * 10} className="h-2" />
                      </div>
                      <span className={`text-sm font-medium ${getQualityColor(prospect.qualityScore)}`}>
                        {prospect.qualityScore}/10
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(prospect.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
