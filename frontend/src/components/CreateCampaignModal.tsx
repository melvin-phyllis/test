import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { X, Globe, Target, Zap, Users, ArrowRight, ChevronDown, Search, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import { CampaignCreate } from '@/types'
import { campaignApi } from '@/services/api'
import { clsx } from 'clsx'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  name: string
  product_description: string
  target_location: string
  target_sectors: string
  prospect_count: number
}

// Données internationales organisées par région
const COUNTRIES = {
  "🇪🇺 Europe": {
    countries: ["France", "Allemagne", "Royaume-Uni", "Espagne", "Italie", "Pays-Bas", "Belgique", "Suisse", "Autriche", "Suède", "Danemark", "Norvège", "Portugal", "Irlande", "Finlande"],
    description: "Marché mature, réglementation RGPD, forte adoption technologique"
  },
  "🇺🇸 Amérique du Nord": {
    countries: ["États-Unis", "Canada", "Mexique"],
    description: "Leader technologique, fort pouvoir d'achat, marché B2B dynamique"
  },
  "🌏 Asie-Pacifique": {
    countries: ["Japon", "Singapour", "Australie", "Nouvelle-Zélande", "Hong Kong", "Corée du Sud", "Inde", "Malaisie", "Thaïlande"],
    description: "Croissance rapide, innovation technologique, marchés émergents"
  },
  "🌍 Afrique": {
    countries: ["Afrique du Sud", "Nigeria", "Kenya", "Maroc", "Égypte", "Côte d'Ivoire", "Ghana", "Tunisie", "Sénégal"],
    description: "Marchés émergents, forte croissance démographique, digitalisation"
  },
  "🌎 Amérique Latine": {
    countries: ["Brésil", "Argentine", "Chili", "Colombie", "Pérou", "Uruguay", "Costa Rica", "Panama"],
    description: "Économies dynamiques, opportunités B2B, secteur tech en croissance"
  },
  "🌐 Multi-Régions": {
    countries: ["Europe de l'Ouest", "Amérique du Nord", "Asie du Sud-Est", "Afrique anglophone", "Afrique francophone", "DACH (Allemagne, Autriche, Suisse)", "Pays nordiques", "Pays du Golfe"],
    description: "Campagnes multi-pays pour expansion rapide et efficace"
  }
}

const MODERN_SECTORS = [
  { id: 'technology', name: 'Technologie', icon: '💻', description: 'Software, Hardware, IT Services' },
  { id: 'fintech', name: 'Finance & FinTech', icon: '💰', description: 'Banques, Assurances, Crypto, Paiements' },
  { id: 'healthtech', name: 'Santé & MedTech', icon: '🏥', description: 'Dispositifs médicaux, E-santé, Biotech' },
  { id: 'ecommerce', name: 'E-commerce & Retail', icon: '🛒', description: 'Commerce en ligne, MarketPlaces, Retail' },
  { id: 'saas', name: 'SaaS & Logiciels', icon: '☁️', description: 'Cloud, Applications métier, Platforms' },
  { id: 'industry40', name: 'Industrie 4.0', icon: '🏭', description: 'IoT, Automatisation, Manufacturing' },
  { id: 'automotive', name: 'Automobile', icon: '🚗', description: 'Constructeurs, Équipementiers, Mobilité' },
  { id: 'proptech', name: 'Immobilier & PropTech', icon: '🏠', description: 'Real Estate, Smart Buildings, Construction' },
  { id: 'energytech', name: 'Énergie Renouvelable', icon: '⚡', description: 'Solaire, Éolien, Smart Grid, Batteries' },
  { id: 'edtech', name: 'EdTech & Formation', icon: '📚', description: 'E-learning, Formation pro, Universities' },
  { id: 'agtech', name: 'Agriculture & AgTech', icon: '🌱', description: 'Agriculture de précision, FoodTech' },
  { id: 'telecom', name: 'Télécommunications', icon: '📡', description: '5G, Réseaux, Opérateurs, Équipements' },
  { id: 'transport', name: 'Transport & Mobilité', icon: '🚀', description: 'Logistique, Supply Chain, Smart Mobility' },
  { id: 'consulting', name: 'Consulting & Services', icon: '👔', description: 'Conseil, Services professionnels, Audit' },
  { id: 'manufacturing', name: 'Manufacturing', icon: '⚙️', description: 'Production, Usines, Équipements industriels' },
  { id: 'blockchain', name: 'Blockchain & Crypto', icon: '⛓️', description: 'DeFi, NFT, Smart Contracts, Web3' },
  { id: 'ai', name: 'Intelligence Artificielle', icon: '🤖', description: 'ML, Data Science, Computer Vision' },
  { id: 'cybersecurity', name: 'Cybersécurité', icon: '🔐', description: 'Sécurité IT, Protection données, Compliance' },
  { id: 'gaming', name: 'Gaming & Entertainment', icon: '🎮', description: 'Jeux vidéo, Streaming, Médias digitaux' },
  { id: 'biotech', name: 'Biotechnologie', icon: '🧬', description: 'R&D Pharmaceutique, Life Sciences, Genomics' }
]

export default function CreateCampaignModal({
  isOpen,
  onClose,
  onSuccess
}: CreateCampaignModalProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const createCampaignMutation = useMutation(
    (data: CampaignCreate) => campaignApi.createCampaign(data),
    {
      onSuccess: () => {
        setSuccess(true)
        queryClient.invalidateQueries('campaigns')
        setTimeout(() => {
          handleClose()
          onSuccess?.()
        }, 1500)
      },
      onError: (error: any) => {
        setError(error.response?.data?.message || 'Erreur lors de la création de la campagne')
      }
    }
  )
  const [selectedSectors, setSelectedSectors] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [searchCountry, setSearchCountry] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [previewData, setPreviewData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      target_location: 'France',
      prospect_count: 10
    }
  })

  const watchedValues = watch()

  // Generate preview data
  useEffect(() => {
    if (watchedValues.name && watchedValues.target_location) {
      setPreviewData({
        estimatedDuration: "2-4 heures",
        agentWorkflow: [
          "Recherche de marché ciblée",
          "Identification des prospects qualifiés", 
          "Extraction des contacts",
          "Création de contenu personnalisé"
        ],
        estimatedProspects: watchedValues.prospect_count || 10
      })
    }
  }, [watchedValues])

  const handleClose = () => {
    reset()
    setSelectedSectors([])
    setCurrentStep(1)
    setError(null)
    setSuccess(false)
    onClose()
  }

  const handleFormSubmit = (data: FormData) => {
    setError(null)
    const campaignData: CampaignCreate = {
      name: data.name,
      product_description: data.product_description,
      target_location: data.target_location,
      target_sectors: selectedSectors,
      prospect_count: data.prospect_count
    }

    createCampaignMutation.mutate(campaignData)
  }

  const toggleSector = (sectorId: string) => {
    setSelectedSectors(prev => 
      prev.includes(sectorId)
        ? prev.filter(s => s !== sectorId)
        : [...prev, sectorId]
    )
  }

  const getRegionDescription = () => {
    const region = Object.entries(COUNTRIES).find(([key]) => key === selectedRegion)
    return region ? region[1].description : ""
  }

  const filteredCountries = searchCountry
    ? Object.entries(COUNTRIES).reduce((acc, [region, data]) => {
        const filtered = data.countries.filter(country => 
          country.toLowerCase().includes(searchCountry.toLowerCase())
        )
        if (filtered.length > 0) {
          acc[region] = { ...data, countries: filtered }
        }
        return acc
      }, {} as typeof COUNTRIES)
    : COUNTRIES

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                Nouvelle Campagne Internationale
              </h2>
              <p className="text-gray-600 mt-2">Créez votre campagne de prospection IA avec des agents spécialisés</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-full transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Steps Progress */}
          <div className="px-8 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-center space-x-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    currentStep >= step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  )}>
                    {step}
                  </div>
                  <span className={clsx(
                    "ml-2 text-sm font-medium",
                    currentStep >= step ? "text-blue-600" : "text-gray-500"
                  )}>
                    {step === 1 && "Détails"}
                    {step === 2 && "Ciblage"}  
                    {step === 3 && "Configuration"}
                  </span>
                  {step < 3 && <ArrowRight className="h-4 w-4 text-gray-400 ml-4" />}
                </div>
              ))}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="text-sm text-red-700">{error}</div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mx-8 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <div className="text-sm text-green-700">Campagne créée avec succès ! Redirection en cours...</div>
            </div>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="flex min-h-[600px]">
              {/* Main Form Content */}
              <div className="flex-1 p-8 overflow-y-auto">
                
                {/* Step 1: Campaign Details */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <Globe className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900">Détails de la Campagne</h3>
                      <p className="text-gray-600 mt-2">Définissez les bases de votre prospection internationale</p>
                    </div>

                    {/* Campaign Name */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-3">
                        Nom de la campagne *
                      </label>
                      <input
                        type="text"
                        {...register('name', { required: 'Le nom est obligatoire' })}
                        className={clsx(
                          'w-full px-6 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all',
                          errors.name ? 'border-red-300' : 'border-gray-200'
                        )}
                        placeholder="Ex: Expansion Tech Europe, FinTech Canada..."
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                          <span className="h-4 w-4 text-red-500">⚠️</span>
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Product Description */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-3">
                        Description du produit/service *
                      </label>
                      <div className="relative">
                        <textarea
                          {...register('product_description', { 
                            required: 'La description est obligatoire',
                            minLength: { value: 20, message: 'Minimum 20 caractères' }
                          })}
                          rows={6}
                          className={clsx(
                            'w-full px-6 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none',
                            errors.product_description ? 'border-red-300' : 'border-gray-200'
                          )}
                          placeholder="Décrivez en détail votre produit ou service, ses avantages, sa valeur ajoutée..."
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                          Les agents IA utiliseront cette description pour identifier les prospects pertinents
                        </div>
                      </div>
                      {errors.product_description && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                          <span className="h-4 w-4 text-red-500">⚠️</span>
                          {errors.product_description.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        disabled={!watchedValues.name || !watchedValues.product_description}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
                      >
                        Continuer
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Geographic & Sector Targeting */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <Target className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900">Ciblage International</h3>
                      <p className="text-gray-600 mt-2">Sélectionnez vos marchés et secteurs cibles</p>
                    </div>

                    {/* Country Selection */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-4">
                        Pays/Région cible *
                      </label>
                      
                      {/* Search Countries */}
                      <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={searchCountry}
                          onChange={(e) => setSearchCountry(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                          placeholder="Rechercher un pays..."
                        />
                      </div>

                      <select
                        {...register('target_location')}
                        className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                        onChange={(e) => {
                          const value = e.target.value
                          // Find which region this country belongs to
                          const region = Object.entries(COUNTRIES).find(([, data]) => 
                            data.countries.includes(value)
                          )?.[0]
                          setSelectedRegion(region || "")
                        }}
                      >
                        {Object.entries(filteredCountries).map(([region, data]) => (
                          <optgroup key={region} label={region}>
                            {data.countries.map((country) => (
                              <option key={country} value={country}>{country}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      
                      {/* Region Description */}
                      {getRegionDescription() && (
                        <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <p className="text-sm text-blue-800">{getRegionDescription()}</p>
                        </div>
                      )}
                    </div>

                    {/* Sector Selection */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-4">
                        Secteurs d'activité cibles (optionnel)
                      </label>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto border-2 border-gray-200 rounded-xl p-6">
                        {MODERN_SECTORS.map((sector) => (
                          <label key={sector.id} className={clsx(
                            "flex flex-col p-4 rounded-xl cursor-pointer transition-all border-2",
                            selectedSectors.includes(sector.id)
                              ? "bg-blue-50 border-blue-300"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          )}>
                            <div className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                checked={selectedSectors.includes(sector.id)}
                                onChange={() => toggleSector(sector.id)}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-3 text-2xl">{sector.icon}</span>
                              <span className="ml-2 font-semibold text-gray-900">{sector.name}</span>
                            </div>
                            <span className="text-xs text-gray-600 ml-8">{sector.description}</span>
                          </label>
                        ))}
                      </div>
                      <p className="mt-4 text-sm text-gray-600 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                        <Zap className="h-4 w-4 inline mr-2 text-yellow-600" />
                        <strong>{selectedSectors.length} secteur(s) sélectionné(s)</strong> - Les agents IA s'adapteront automatiquement à la culture et aux pratiques d'affaires locales
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="inline-flex items-center gap-2 px-8 py-4 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                      >
                        Retour
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all"
                      >
                        Continuer
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Configuration */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900">Configuration Avancée</h3>
                      <p className="text-gray-600 mt-2">Définissez les paramètres de votre campagne</p>
                    </div>

                    {/* Prospect Count */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-4">
                        Nombre de prospects souhaités
                      </label>
                      <div className="space-y-4">
                        <input
                          type="range"
                          {...register('prospect_count', { 
                            required: 'Le nombre de prospects est obligatoire',
                            min: { value: 1, message: 'Minimum 1 prospect' },
                            max: { value: 100, message: 'Maximum 100 prospects' }
                          })}
                          min="1"
                          max="100"
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>1</span>
                          <span className="font-semibold text-xl text-blue-600">{watchedValues.prospect_count || 10}</span>
                          <span>100</span>
                        </div>
                      </div>
                      {errors.prospect_count && (
                        <p className="mt-2 text-sm text-red-600">{errors.prospect_count.message}</p>
                      )}
                    </div>

                    {/* AI Agent Configuration */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Bot className="h-5 w-5 text-blue-600" />
                        Configuration des Agents IA
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-blue-200">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🔍</span>
                            <span className="font-semibold">Market Researcher</span>
                          </div>
                          <p className="text-sm text-gray-600">Recherche et qualification des entreprises cibles</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-blue-200">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🌐</span>
                            <span className="font-semibold">Prospecting Specialist</span>
                          </div>
                          <p className="text-sm text-gray-600">Extraction et vérification des contacts</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-blue-200">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">✍️</span>
                            <span className="font-semibold">Content Writer</span>
                          </div>
                          <p className="text-sm text-gray-600">Contenu personnalisé et culturellement adapté</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="inline-flex items-center gap-2 px-8 py-4 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                      >
                        Retour
                      </button>
                      <button
                        type="submit"
                        disabled={createCampaignMutation.isLoading || success}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-semibold transition-all shadow-lg"
                      >
                        {createCampaignMutation.isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Création en cours...
                          </>
                        ) : success ? (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            Campagne créée !
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5" />
                            Lancer la campagne
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Panel */}
              {previewData && (
                <div className="w-80 bg-gradient-to-b from-gray-50 to-gray-100 border-l border-gray-200 p-6">
                  <div className="sticky top-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-600" />
                      Aperçu de la Campagne
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="text-sm font-semibold text-gray-900 mb-2">Campagne</div>
                        <div className="text-gray-700">{watchedValues.name || "Nom de campagne"}</div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="text-sm font-semibold text-gray-900 mb-2">Cible</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {Object.entries(COUNTRIES).find(([, data]) => 
                              data.countries.includes(watchedValues.target_location)
                            )?.[0].charAt(0) || "🌍"}
                          </span>
                          <span className="text-gray-700">{watchedValues.target_location}</span>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="text-sm font-semibold text-gray-900 mb-2">Prospects</div>
                        <div className="text-2xl font-bold text-blue-600">{previewData.estimatedProspects}</div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="text-sm font-semibold text-gray-900 mb-2">Durée Estimée</div>
                        <div className="text-gray-700">{previewData.estimatedDuration}</div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="text-sm font-semibold text-gray-900 mb-3">Workflow IA</div>
                        <div className="space-y-2">
                          {previewData.agentWorkflow.map((step: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <div className="text-sm font-semibold text-blue-900 mb-2">Intelligence Artificielle</div>
                        <div className="text-xs text-blue-800">
                          3 agents spécialisés travailleront en séquence pour identifier, analyser et contacter vos prospects cibles avec une approche culturellement adaptée.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}