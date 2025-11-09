import { useState } from 'react'
import { X } from 'lucide-react'
import type { Equipment, EquipmentCategory } from '../types'
import { EquipmentCategory as EC } from '../types'

interface AddEquipmentModalProps {
  gymId: string
  onSave: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function AddEquipmentModal({ gymId, onSave, onCancel }: AddEquipmentModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<EquipmentCategory>(EC.OTHER)
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [notes, setNotes] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    onSave({
      gymId,
      name: name.trim(),
      category,
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      notes: notes.trim() || undefined,
      isAvailable
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Add Equipment</h2>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="equipment-name">Equipment Name *</label>
            <input
              id="equipment-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Life Fitness Treadmill"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="equipment-category">Category *</label>
            <select
              id="equipment-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
              required
            >
              {Object.values(EC).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="equipment-brand">Brand</label>
              <input
                id="equipment-brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g., Life Fitness"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="equipment-model">Model</label>
              <input
                id="equipment-model"
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g., T3"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="equipment-notes">Notes</label>
            <textarea
              id="equipment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details, weight ranges, special features..."
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
              Equipment is currently available
            </label>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn secondary">
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Add Equipment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
