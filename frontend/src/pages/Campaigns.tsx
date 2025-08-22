import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Play,
  Pause,
  Eye,
  Trash2
} from 'lucide-react'
import { campaignApi } from '@/services/api'
import { Campaign, CampaignCreate } from '@/types'
import { clsx } from 'clsx'
import { formatDate } from '@/utils'
import toast from 'react-hot-toast'
import CreateCampaignModal from '@/components/CreateCampaignModal'

export default function Campaigns() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  const queryClient = useQueryClient()

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>(
    ['campaigns', { status: statusFilter !== 'all' ? statusFilter : undefined }],
    () => campaignApi.getCampaigns({ 
      status: statusFilter !== 'all' ? statusFilter : undefined 
    }).then(res => res.data)
  )

  const createCampaignMutation = useMutation(
    (data: CampaignCreate) => campaignApi.createCampaign(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('campaigns')
        setIsCreateModalOpen(false)
        toast.success('Campagne créée avec succès')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Erreur lors de la création')
      }
    }
  )

  const startCampaignMutation = useMutation(
    (id: number) => campaignApi.startCampaign(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('campaigns')
        toast.success('Campagne démarrée')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Erreur lors du démarrage')
      }
    }
  )

  const stopCampaignMutation = useMutation(
    (id: number) => campaignApi.stopCampaign(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('campaigns')
        toast.success('Campagne arrêtée')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Erreur lors de l\'arrêt')
      }
    }
  )

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.product_description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateCampaign = (data: CampaignCreate) => {
    createCampaignMutation.mutate(data)
  }

  const handleStartCampaign = (id: number) => {
    startCampaignMutation.mutate(id)
  }

  const handleStopCampaign = (id: number) => {
    stopCampaignMutation.mutate(id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campagnes</h1>
          <p className="text-gray-600">Gérez vos campagnes de prospection</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle campagne
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une campagne..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="running">En cours</option>
          <option value="completed">Terminées</option>
          <option value="failed">Échouées</option>
          <option value="cancelled">Annulées</option>
        </select>
      </div>

      {/* Campaigns list */}
      <div className="card">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campagne
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prospects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créée le
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {campaign.product_description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx('status-badge', `status-${campaign.status}`)}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {campaign.results_summary?.prospects_found || 0} / {campaign.prospect_count}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
{formatDate(campaign.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <CampaignActions 
                        campaign={campaign}
                        onStart={handleStartCampaign}
                        onStop={handleStopCampaign}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">Aucune campagne trouvée</p>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCampaign}
        loading={createCampaignMutation.isLoading}
      />
    </div>
  )
}

interface CampaignActionsProps {
  campaign: Campaign
  onStart: (id: number) => void
  onStop: (id: number) => void
}

function CampaignActions({ campaign, onStart, onStop }: CampaignActionsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="text-gray-400 hover:text-gray-600"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <Link
              to={`/campaigns/${campaign.id}`}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </Link>
            
            {campaign.status === 'pending' && (
              <button
                onClick={() => {
                  onStart(campaign.id)
                  setIsMenuOpen(false)
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Play className="h-4 w-4 mr-2" />
                Démarrer
              </button>
            )}
            
            {campaign.status === 'running' && (
              <button
                onClick={() => {
                  onStop(campaign.id)
                  setIsMenuOpen(false)
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Pause className="h-4 w-4 mr-2" />
                Arrêter
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}