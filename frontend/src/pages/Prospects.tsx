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
  Star,
  MapPin,
  Building,
  User,
  Globe,
  TrendingUp,
  Eye,
  MoreVertical,
  Linkedin,
  Calendar,
  Tag,
  ArrowUpDown,
  X,
  ChevronDown
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
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [qualityScoreFilter, setQualityScoreFilter] = useState<[number, number]>([0, 10])
  const [campaignFilter, setCampaignFilter] = useState<string>(initialCampaignId || 'all')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedProspects, setSelectedProspects] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Queries
  const { data: prospects = [], isLoading, error: prospectsError } = useQuery<Prospect[]>(
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
    }).then(res => res.data),
    {
      retry: 3,
      retryDelay: 1000
    }
  )

  const { data: campaigns = [], error: campaignsError } = useQuery<Campaign[]>(
    'campaigns',
    () => campaignApi.getCampaigns().then(res => res.data),
    {
      retry: 3,
      retryDelay: 1000
    }
  )

  // Country flags mapping
  const countryFlags: Record<string, string> = {
    'France': '🇫🇷',
    'Allemagne': '🇩🇪', 
    'Canada': '🇨🇦',
    'Royaume-Uni': '🇬🇧',
    'États-Unis': '🇺🇸',
    'Espagne': '🇪🇸',
    'Italie': '🇮🇹',
    'Pays-Bas': '🇳🇱',
    'Japon': '🇯🇵',
    'Australie': '🇦🇺',
    'Brésil': '🇧🇷',
    'Inde': '🇮🇳'
  }

  // Filter prospects by search term and other filters
  const filteredProspects = prospects
    .filter(prospect => {
      // Search filter
      const searchMatch = prospect.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prospect.contact_name && prospect.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prospect.email && prospect.email.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Country filter
      const countryMatch = countryFilter === 'all' || prospect.location?.includes(countryFilter)
      
      // Quality score filter
      const qualityMatch = prospect.quality_score >= qualityScoreFilter[0] && prospect.quality_score <= qualityScoreFilter[1]
      
      return searchMatch && countryMatch && qualityMatch
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'company_name':
          aValue = a.company_name
          bValue = b.company_name
          break
        case 'quality_score':
          aValue = a.quality_score
          bValue = b.quality_score
          break
        case 'created_at':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        default:
          aValue = a.created_at
          bValue = b.created_at
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Get unique sectors and countries
  const uniqueSectors = [...new Set(prospects.map(p => p.sector).filter(Boolean))]
  const uniqueCountries = [...new Set(prospects.map(p => {
    const location = p.location || ''
    // Extract country from location (assume format: "City, Country")
    const parts = location.split(',')
    return parts.length > 1 ? parts[parts.length - 1].trim() : location
  }).filter(Boolean))]

  const exportToCSV = () => {
    const headers = [
      'Entreprise',
      'Secteur',
      'Pays',
      'Contact',
      'Position',
      'Email',
      'Téléphone',
      'LinkedIn',
      'Site web',
      'Score qualité',
      'Statut',
      'Date création'
    ]

    const csvData = filteredProspects.map(prospect => [
      prospect.company_name,
      prospect.sector || '',
      prospect.location || '',
      prospect.contact_name || '',
      prospect.contact_position || '',
      prospect.email || '',
      prospect.phone || '',
      prospect.linkedin || '',
      prospect.website || '',
      prospect.quality_score,
      prospect.status,
      formatDate(prospect.created_at)
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `prospects_internationaux_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getQualityScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-blue-600 bg-blue-100'
    if (score >= 4) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'identified': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'converted': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleProspectSelection = (prospectId: number) => {
    setSelectedProspects(prev => 
      prev.includes(prospectId)
        ? prev.filter(id => id !== prospectId)
        : [...prev, prospectId]
    )
  }

  const selectAllProspects = () => {
    if (selectedProspects.length === filteredProspects.length) {
      setSelectedProspects([])
    } else {
      setSelectedProspects(filteredProspects.map(p => p.id))
    }
  }

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <div className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center">
              <Globe className="h-7 w-7 text-white" />
            </div>
            Prospects Internationaux
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            <span className="font-semibold text-green-600">{filteredProspects.length.toLocaleString()}</span> prospects identifiés dans le monde entier
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('table')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Cartes
            </button>
          </div>
          
          <button
            onClick={exportToCSV}
            disabled={filteredProspects.length === 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold transition-all shadow-lg"
          >
            <Download className="h-5 w-5" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher prospect, entreprise, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pays</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none bg-white transition-all"
              >
                <option value="all">Tous les pays</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>
                    {countryFlags[country] || '🌍'} {country}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Sector Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Secteur</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none bg-white transition-all"
              >
                <option value="all">Tous secteurs</option>
                {uniqueSectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none bg-white transition-all"
              >
                <option value="all">Tous statuts</option>
                <option value="identified">Identifié</option>
                <option value="contacted">Contacté</option>
                <option value="qualified">Qualifié</option>
                <option value="converted">Converti</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Campaign Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Campagne</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none bg-white transition-all"
              >
                <option value="all">Toutes campagnes</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id.toString()}>
                    {campaign.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Quality Score Filter */}
          <div className="lg:col-span-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Score de Qualité: {qualityScoreFilter[0]} - {qualityScoreFilter[1]}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="10"
                value={qualityScoreFilter[0]}
                onChange={(e) => setQualityScoreFilter([parseInt(e.target.value), qualityScoreFilter[1]])}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="10"
                value={qualityScoreFilter[1]}
                onChange={(e) => setQualityScoreFilter([qualityScoreFilter[0], parseInt(e.target.value)])}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || countryFilter !== 'all' || sectorFilter !== 'all' || statusFilter !== 'all' || campaignFilter !== 'all') && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">Filtres actifs:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Recherche: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {countryFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {countryFlags[countryFilter]} {countryFilter}
                  <button onClick={() => setCountryFilter('all')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {(prospectsError || campaignsError) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Erreur de chargement</h3>
              <p className="text-red-700 text-sm">
                {prospectsError ? 'Impossible de charger les prospects. ' : ''}
                {campaignsError ? 'Impossible de charger les campagnes. ' : ''}
                Veuillez réessayer ou contacter le support.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedProspects.length > 0 && !prospectsError && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-blue-900">
                {selectedProspects.length} prospect(s) sélectionné(s)
              </span>
              <button
                onClick={() => setSelectedProspects([])}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Désélectionner tout
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Exporter sélection
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                Marquer comme contacté
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedProspects.length === filteredProspects.length && filteredProspects.length > 0}
                  onChange={selectAllProspects}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Tout sélectionner
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-')
                      setSortBy(field)
                      setSortOrder(order as 'asc' | 'desc')
                    }}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1"
                  >
                    <option value="created_at-desc">Plus récent</option>
                    <option value="created_at-asc">Plus ancien</option>
                    <option value="company_name-asc">Nom A-Z</option>
                    <option value="company_name-desc">Nom Z-A</option>
                    <option value="quality_score-desc">Score élevé</option>
                    <option value="quality_score-asc">Score faible</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des prospects...</p>
            </div>
          ) : filteredProspects.length === 0 ? (
            <div className="p-12 text-center">
              <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun prospect trouvé</h3>
              <p className="text-gray-500">Essayez de modifier vos filtres ou lancez une nouvelle campagne</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={selectedProspects.length === filteredProspects.length && filteredProspects.length > 0}
                        onChange={selectAllProspects}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Entreprise
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Localisation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Secteur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProspects.map((prospect) => {
                    const countryName = prospect.location?.split(',').pop()?.trim() || ''
                    
                    return (
                      <tr key={prospect.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProspects.includes(prospect.id)}
                            onChange={() => toggleProspectSelection(prospect.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-lg font-semibold text-gray-900">
                              {prospect.company_name}
                            </div>
                            {prospect.website && (
                              <a 
                                href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 mt-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {prospect.website}
                              </a>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {prospect.contact_name && (
                              <div className="font-medium text-gray-900 flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                {prospect.contact_name}
                              </div>
                            )}
                            {prospect.contact_position && (
                              <div className="text-sm text-gray-500">{prospect.contact_position}</div>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {prospect.email && (
                                <a
                                  href={`mailto:${prospect.email}`}
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  <Mail className="h-3 w-3" />
                                </a>
                              )}
                              {prospect.phone && (
                                <a
                                  href={`tel:${prospect.phone}`}
                                  className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm"
                                >
                                  <Phone className="h-3 w-3" />
                                </a>
                              )}
                              {prospect.linkedin && (
                                <a
                                  href={prospect.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 text-sm"
                                >
                                  <Linkedin className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{countryFlags[countryName] || '🌍'}</span>
                            <span className="text-sm text-gray-600">{prospect.location}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {prospect.sector || 'Non spécifié'}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={clsx(
                              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold',
                              getQualityScoreColor(prospect.quality_score)
                            )}>
                              {prospect.quality_score.toFixed(1)}
                            </div>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={clsx(
                                    'h-3 w-3',
                                    i < prospect.quality_score / 2 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={clsx(
                            'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                            getStatusColor(prospect.status)
                          )}>
                            {prospect.status}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProspects.map((prospect) => {
            const countryName = prospect.location?.split(',').pop()?.trim() || ''
            
            return (
              <div key={prospect.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedProspects.includes(prospect.id)}
                      onChange={() => toggleProspectSelection(prospect.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-2xl">{countryFlags[countryName] || '🌍'}</span>
                  </div>
                  
                  <div className={clsx(
                    'flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold',
                    getQualityScoreColor(prospect.quality_score)
                  )}>
                    {prospect.quality_score.toFixed(1)}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{prospect.company_name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{prospect.location}</p>
                  {prospect.sector && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {prospect.sector}
                    </span>
                  )}
                </div>
                
                {(prospect.contact_name || prospect.email) && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                    {prospect.contact_name && (
                      <div className="font-medium text-gray-900 mb-1">{prospect.contact_name}</div>
                    )}
                    {prospect.contact_position && (
                      <div className="text-sm text-gray-600 mb-2">{prospect.contact_position}</div>
                    )}
                    <div className="flex items-center gap-2">
                      {prospect.email && (
                        <a href={`mailto:${prospect.email}`} className="p-1 text-blue-600 hover:text-blue-700">
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                      {prospect.linkedin && (
                        <a href={prospect.linkedin} target="_blank" rel="noopener noreferrer" className="p-1 text-blue-700 hover:text-blue-800">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {prospect.phone && (
                        <a href={`tel:${prospect.phone}`} className="p-1 text-green-600 hover:text-green-700">
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className={clsx(
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                    getStatusColor(prospect.status)
                  )}>
                    {prospect.status}
                  </span>
                  
                  <div className="text-xs text-gray-500">
                    {formatDate(prospect.created_at)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}