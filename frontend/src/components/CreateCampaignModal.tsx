import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { CampaignCreate } from '@/types'
import { clsx } from 'clsx'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CampaignCreate) => void
  loading?: boolean
}

interface FormData {
  name: string
  product_description: string
  target_location: string
  target_sectors: string
  prospect_count: number
}

const AVAILABLE_SECTORS = [
  'Agriculture',
  'Banque et Finance',
  'Commerce et Distribution',
  'Construction et BTP',
  'Éducation',
  'Énergie',
  'Industrie',
  'Santé',
  'Services',
  'Technologie',
  'Télécommunications',
  'Transport et Logistique',
  'Tourisme et Hôtellerie'
]

export default function CreateCampaignModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}: CreateCampaignModalProps) {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      target_location: 'Côte d\'Ivoire',
      prospect_count: 10
    }
  })

  const handleClose = () => {
    reset()
    setSelectedSectors([])
    onClose()
  }

  const handleFormSubmit = (data: FormData) => {
    const campaignData: CampaignCreate = {
      name: data.name,
      product_description: data.product_description,
      target_location: data.target_location,
      target_sectors: selectedSectors,
      prospect_count: data.prospect_count
    }

    onSubmit(campaignData)
  }

  const toggleSector = (sector: string) => {
    setSelectedSectors(prev => 
      prev.includes(sector)
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={handleClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Nouvelle campagne de prospection
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
            {/* Campaign Name */}
            <div>
              <label className="label">
                Nom de la campagne *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Le nom est obligatoire' })}
                className={clsx('input', errors.name && 'border-red-500')}
                placeholder="Ex: Prospection PME technologie"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Product Description */}
            <div>
              <label className="label">
                Description du produit/service *
              </label>
              <textarea
                {...register('product_description', { 
                  required: 'La description est obligatoire',
                  minLength: { value: 20, message: 'Minimum 20 caractères' }
                })}
                rows={4}
                className={clsx('input', errors.product_description && 'border-red-500')}
                placeholder="Décrivez en détail votre produit ou service..."
              />
              {errors.product_description && (
                <p className="mt-1 text-sm text-red-600">{errors.product_description.message}</p>
              )}
            </div>

            {/* Target Location */}
            <div>
              <label className="label">
                Localisation cible
              </label>
              <select
                {...register('target_location')}
                className="input"
              >
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                <option value="Abidjan">Abidjan</option>
                <option value="Bouaké">Bouaké</option>
                <option value="Yamoussoukro">Yamoussoukro</option>
                <option value="San Pedro">San Pedro</option>
              </select>
            </div>

            {/* Target Sectors */}
            <div>
              <label className="label">
                Secteurs cibles (optionnel)
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                {AVAILABLE_SECTORS.map((sector) => (
                  <label key={sector} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSectors.includes(sector)}
                      onChange={() => toggleSector(sector)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{sector}</span>
                  </label>
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {selectedSectors.length} secteur(s) sélectionné(s)
              </p>
            </div>

            {/* Prospect Count */}
            <div>
              <label className="label">
                Nombre de prospects souhaités
              </label>
              <input
                type="number"
                {...register('prospect_count', { 
                  required: 'Le nombre de prospects est obligatoire',
                  min: { value: 1, message: 'Minimum 1 prospect' },
                  max: { value: 100, message: 'Maximum 100 prospects' }
                })}
                className={clsx('input', errors.prospect_count && 'border-red-500')}
                min="1"
                max="100"
              />
              {errors.prospect_count && (
                <p className="mt-1 text-sm text-red-600">{errors.prospect_count.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création...
                  </>
                ) : (
                  'Créer la campagne'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}