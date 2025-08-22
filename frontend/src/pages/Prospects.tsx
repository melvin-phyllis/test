import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { useSearchParams } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  ExternalLink,
  Star
} from 'lucide-react'
import { prospectApi, campaignApi } from '@/services/api'
import { Prospect, Campaign } from '@/types'
import { clsx } from 'clsx'
import { formatDate } from '@/utils'

export default function Prospects() {
  const [searchParams] = useSearchParams()
  const initialCampaignId = searchParams.get('campaign_id')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sectorFilter, setSectorFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [campaignFilter, setCampaignFilter] = useState<string>(initialCampaignId || 'all')

  // Queries
  const { data: prospects = [], isLoading } = useQuery<Prospect[]>(
    ['prospects', { 
      campaign_id: campaignFilter !== 'all' ? parseInt(campaignFilter) : undefined,
      sector: sectorFilter !== 'all' ? sectorFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined
    }],
    () => prospectApi.getProspects({
      campaign_id: campaignFilter !== 'all' ? parseInt(campaignFilter) : undefined,
      sector: sectorFilter !== 'all' ? sectorFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      limit: 100
    }).then(res => res.data)
  )

  const { data: campaigns = [] } = useQuery<Campaign[]>(
    'campaigns',
    () => campaignApi.getCampaigns().then(res => res.data)
  )

  // Filter prospects by search term
  const filteredProspects = prospects.filter(prospect =>
    prospect.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prospect.contact_name && prospect.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (prospect.email && prospect.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Get unique sectors
  const uniqueSectors = Array.from(new Set(prospects.map(p => p.sector).filter(Boolean)))

  const exportToCSV = () => {
    const headers = [
      'Entreprise',
      'Secteur',
      'Contact',
      'Position',
      'Email',
      'Téléphone',
      'Site web',
      'Score qualité',
      'Statut',
      'Localisation'
    ]

    const csvData = filteredProspects.map(prospect => [
      prospect.company_name,
      prospect.sector || '',
      prospect.contact_name || '',
      prospect.contact_position || '',
      prospect.email || '',
      prospect.phone || '',
      prospect.website || '',
      prospect.quality_score,
      prospect.status,
      prospect.location || ''
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `prospects_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prospects Internationaux</h1>
          <p className="text-gray-600">
            {filteredProspects.length} prospect(s) trouvé(s) dans le monde entier
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredProspects.length === 0}
          className="btn-secondary"
        >
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un prospect..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        
        <select
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="input w-auto min-w-48"
        >
          <option value="all">Toutes les campagnes</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id.toString()}>
              {campaign.name}
            </option>
          ))}
        </select>
        
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">Tous les secteurs</option>
          {uniqueSectors.map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">Tous les statuts</option>
          <option value="identified">Identifié</option>
          <option value="contacted">Contacté</option>
          <option value="qualified">Qualifié</option>
          <option value="converted">Converti</option>
        </select>
      </div>

      {/* Prospects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <ProspectCardSkeleton key={i} />
          ))
        ) : filteredProspects.length > 0 ? (
          filteredProspects.map((prospect) => (
            <ProspectCard key={prospect.id} prospect={prospect} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Aucun prospect trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface ProspectCardProps {
  prospect: Prospect
}

function ProspectCard({ prospect }: ProspectCardProps) {
  const campaign = useQuery<Campaign>(
    ['campaign', prospect.campaign_id],
    () => campaignApi.getCampaign(prospect.campaign_id).then(res => res.data)
  )

  const qualityStars = Math.round(prospect.quality_score / 2) // Convert to 5-star scale

  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{prospect.company_name}</h3>
          <p className="text-sm text-gray-500">{prospect.sector}</p>
          {campaign.data && (
            <p className="text-xs text-gray-400 mt-1">
              Campagne: {campaign.data.name}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={clsx(
                'h-4 w-4',
                i < qualityStars ? 'text-yellow-400 fill-current' : 'text-gray-300'
              )}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      {prospect.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {prospect.description}
        </p>
      )}

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {prospect.contact_name && (
          <div className="flex items-center text-sm">
            <span className="font-medium text-gray-700">{prospect.contact_name}</span>
            {prospect.contact_position && (
              <span className="text-gray-500 ml-2">• {prospect.contact_position}</span>
            )}
          </div>
        )}
        
        {prospect.email && (
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            <a href={`mailto:${prospect.email}`} className="hover:text-primary-600">
              {prospect.email}
            </a>
          </div>
        )}
        
        {prospect.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            <a href={`tel:${prospect.phone}`} className="hover:text-primary-600">
              {prospect.phone}
            </a>
          </div>
        )}
        
        {prospect.website && (
          <div className="flex items-center text-sm text-gray-600">
            <ExternalLink className="h-4 w-4 mr-2" />
            <a 
              href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600"
            >
              {prospect.website}
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className={clsx('status-badge', `status-${prospect.status}`)}>
          {prospect.status}
        </span>
        <span className="text-xs text-gray-500">
          {formatDate(prospect.created_at)}
        </span>
      </div>
    </div>
  )
}

function ProspectCardSkeleton() {
  return (
    <div className="card p-6">
      <div className="animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  )
}