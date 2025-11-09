import { Dumbbell, Trash2, Eye, EyeOff } from 'lucide-react'
import type { Equipment, EquipmentCategory } from '../types'

interface EquipmentListProps {
  equipment: Equipment[]
  onDeleteEquipment: (equipmentId: string) => void
  onToggleAvailability: (equipmentId: string) => void
}

export function EquipmentList({ equipment, onDeleteEquipment, onToggleAvailability }: EquipmentListProps) {
  if (equipment.length === 0) {
    return (
      <div className="empty-list">
        <Dumbbell size={48} />
        <h3>No equipment logged yet</h3>
        <p>Start adding equipment to build your gym inventory.</p>
      </div>
    )
  }

  // Group equipment by category
  const groupedEquipment = equipment.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<EquipmentCategory, Equipment[]>)

  return (
    <div className="equipment-list">
      {Object.entries(groupedEquipment).map(([category, items]) => (
        <div key={category} className="equipment-category">
          <h3 className="category-title">{category}</h3>
          <div className="equipment-items">
            {items.map(item => (
              <div 
                key={item.id} 
                className={`equipment-item ${!item.isAvailable ? 'unavailable' : ''}`}
              >
                <div className="equipment-info">
                  <div className="equipment-name">
                    <Dumbbell size={16} />
                    {item.name}
                  </div>
                  {(item.brand || item.model) && (
                    <div className="equipment-details">
                      {[item.brand, item.model].filter(Boolean).join(' ')}
                    </div>
                  )}
                  {item.notes && (
                    <div className="equipment-notes">{item.notes}</div>
                  )}
                </div>
                <div className="equipment-actions">
                  <button
                    className={`availability-btn ${item.isAvailable ? 'available' : 'unavailable'}`}
                    onClick={() => onToggleAvailability(item.id)}
                    title={item.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
                  >
                    {item.isAvailable ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                        onDeleteEquipment(item.id)
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
