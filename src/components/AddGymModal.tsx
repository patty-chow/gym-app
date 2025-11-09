import { useState } from 'react'
import { X } from 'lucide-react'
import type { Gym } from '../types'

interface AddGymModalProps {
  onSave: (gym: Omit<Gym, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function AddGymModal({ onSave, onCancel }: AddGymModalProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !address.trim()) return
    
    onSave({
      name: name.trim(),
      address: address.trim(),
      notes: notes.trim() || undefined
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Add New Gym</h2>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="gym-name">Gym Name *</label>
            <input
              id="gym-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., LA Fitness Downtown"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="gym-address">Address *</label>
            <input
              id="gym-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 123 Main St, City, State"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="gym-notes">Notes (optional)</label>
            <textarea
              id="gym-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this gym..."
              rows={3}
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn secondary">
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Add Gym
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
