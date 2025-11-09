import { MapPin, Trash2 } from 'lucide-react'
import type { Gym } from '../types'

interface GymListProps {
  gyms: Gym[]
  selectedGym: Gym | null
  onSelectGym: (gym: Gym) => void
  onDeleteGym: (gymId: string) => void
}

export function GymList({ gyms, selectedGym, onSelectGym, onDeleteGym }: GymListProps) {
  if (gyms.length === 0) {
    return (
      <div className="empty-list">
        <p>No gyms added yet</p>
      </div>
    )
  }

  return (
    <div className="gym-list">
      {gyms.map(gym => (
        <div 
          key={gym.id}
          className={`gym-item ${selectedGym?.id === gym.id ? 'selected' : ''}`}
          onClick={() => onSelectGym(gym)}
        >
          <div className="gym-info">
            <div className="gym-name">
              <MapPin size={16} />
              {gym.name}
            </div>
            <div className="gym-address">{gym.address}</div>
          </div>
          <button 
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Are you sure you want to delete ${gym.name}? This will also delete all equipment data for this gym.`)) {
                onDeleteGym(gym.id)
              }
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
