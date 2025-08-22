export { cn } from './cn'

// Safe date formatting
export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide'
    }
    
    // Simple date formatting without date-fns dependency issues
    const day = dateObj.getDate().toString().padStart(2, '0')
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
    const year = dateObj.getFullYear()
    
    if (formatStr === 'dd/MM/yyyy') {
      return `${day}/${month}/${year}`
    } else if (formatStr === 'dd MMM yyyy') {
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 
                     'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
      return `${day} ${months[dateObj.getMonth()]} ${year}`
    }
    
    return dateObj.toLocaleDateString('fr-FR')
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Date invalide'
  }
}

export function formatTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      return '--:--'
    }
    return dateObj.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch (error) {
    return '--:--'
  }
}

export function formatTimeAgo(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      return 'Date inconnue'
    }
    
    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
    
    return formatDate(dateObj, 'dd/MM/yyyy')
  } catch (error) {
    return 'Date inconnue'
  }
}