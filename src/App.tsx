import { useState, useEffect } from 'react'
import { Dumbbell, MapPin, Plus, Download, FileText } from 'lucide-react'
import type { Gym, Equipment } from './types'
import { storage } from './storage'
import { GymList, EquipmentList, AddGymModal, AddEquipmentModal } from './components'
import './App.css'

function App() {
  // Debug info
  const storageMode = import.meta.env.VITE_STORAGE_MODE || 'localStorage'
  const isFileMode = storageMode === 'file'
  
  console.log('🔧 Debug Info:')
  console.log('Storage Mode:', storageMode)
  console.log('Is File Storage:', isFileMode)
  console.log('Environment:', import.meta.env)

  const [gyms, setGyms] = useState<Gym[]>([])
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [showAddGym, setShowAddGym] = useState(false)
  const [showAddEquipment, setShowAddEquipment] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        // Initialize storage if using file storage
        if ('init' in storage) {
          await storage.init();
        }
        
        const loadedGyms = await Promise.resolve(storage.getGyms());
        const loadedEquipment = await Promise.resolve(storage.getEquipment());
        
        setGyms(loadedGyms);
        setEquipment(loadedEquipment);
        
        if (loadedGyms.length > 0 && !selectedGym) {
          setSelectedGym(loadedGyms[0]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }
    
    loadData();
  }, [])

  const handleAddGym = async (gymData: Omit<Gym, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('🏋️ Adding gym with storage mode:', storageMode);
      console.log('📁 Is file storage:', isFileMode);
      console.log('🏢 Gym data:', gymData);
      
      const newGym = await Promise.resolve(storage.addGym(gymData));
      console.log('✅ Gym added successfully:', newGym);
      
      setGyms(prev => [...prev, newGym]);
      setSelectedGym(newGym);
      setShowAddGym(false);
    } catch (error) {
      console.error('❌ Failed to add gym:', error);
    }
  }

  const handleDeleteGym = async (gymId: string) => {
    try {
      await Promise.resolve(storage.deleteGym(gymId));
      setGyms(prev => prev.filter(g => g.id !== gymId));
      setEquipment(prev => prev.filter(e => e.gymId !== gymId));
      
      if (selectedGym?.id === gymId) {
        const remainingGyms = gyms.filter(g => g.id !== gymId);
        setSelectedGym(remainingGyms.length > 0 ? remainingGyms[0] : null);
      }
    } catch (error) {
      console.error('Failed to delete gym:', error);
    }
  }

  const handleAddEquipment = async (equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEquipment = await Promise.resolve(storage.addEquipment(equipmentData));
      setEquipment(prev => [...prev, newEquipment]);
      setShowAddEquipment(false);
    } catch (error) {
      console.error('Failed to add equipment:', error);
    }
  }

  const handleDeleteEquipment = async (equipmentId: string) => {
    try {
      await Promise.resolve(storage.deleteEquipment(equipmentId));
      setEquipment(prev => prev.filter(e => e.id !== equipmentId));
    } catch (error) {
      console.error('Failed to delete equipment:', error);
    }
  }

  const handleToggleAvailability = async (equipmentId: string) => {
    try {
      const item = equipment.find(e => e.id === equipmentId);
      if (item) {
        const updated = await Promise.resolve(storage.updateEquipment(equipmentId, { isAvailable: !item.isAvailable }));
        if (updated) {
          setEquipment(prev => prev.map(e => e.id === equipmentId ? updated : e));
        }
      }
    } catch (error) {
      console.error('Failed to toggle equipment availability:', error);
    }
  }

  const handleExportData = async () => {
    try {
      const chatGPTFormat = await Promise.resolve(storage.exportToChatGPTFormat());
      const blob = new Blob([chatGPTFormat], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gym-equipment-inventory.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  }

  const handleExportJSON = async () => {
    try {
      const jsonData = await Promise.resolve(storage.exportToJSON());
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gym-equipment-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export JSON:', error);
    }
  }

  const selectedGymEquipment = selectedGym ? equipment.filter(e => e.gymId === selectedGym.id) : []

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <Dumbbell className="header-icon" />
            <h1>Gym Equipment Logger</h1>
          </div>
          <div className="header-actions">
            <div className="storage-indicator" title={`Storage mode: ${storageMode}`}>
              {isFileMode ? '📁 File Storage' : '💾 Local Storage'}
            </div>
            <button onClick={handleExportData} className="export-btn" title="Export for ChatGPT">
              <FileText size={18} />
              Export for ChatGPT
            </button>
            <button onClick={handleExportJSON} className="export-btn secondary" title="Export JSON">
              <Download size={18} />
              Export JSON
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="sidebar">
          <div className="sidebar-header">
            <h2><MapPin size={20} /> My Gyms</h2>
            <button onClick={() => setShowAddGym(true)} className="add-btn">
              <Plus size={16} />
            </button>
          </div>
          <GymList 
            gyms={gyms}
            selectedGym={selectedGym}
            onSelectGym={setSelectedGym}
            onDeleteGym={handleDeleteGym}
          />
        </div>

        <div className="main-content">
          {selectedGym ? (
            <>
              <div className="content-header">
                <div>
                  <h2>{selectedGym.name}</h2>
                  <p className="gym-address">{selectedGym.address}</p>
                  {selectedGym.notes && <p className="gym-notes">{selectedGym.notes}</p>}
                </div>
                <button 
                  onClick={() => setShowAddEquipment(true)} 
                  className="add-btn primary"
                >
                  <Plus size={16} />
                  Add Equipment
                </button>
              </div>
              <EquipmentList 
                equipment={selectedGymEquipment}
                onDeleteEquipment={handleDeleteEquipment}
                onToggleAvailability={handleToggleAvailability}
              />
            </>
          ) : (
            <div className="empty-state">
              <Dumbbell size={64} />
              <h2>No gyms added yet</h2>
              <p>Start by adding your first gym to begin logging equipment.</p>
              <button onClick={() => setShowAddGym(true)} className="add-btn primary">
                <Plus size={16} />
                Add Your First Gym
              </button>
            </div>
          )}
        </div>
      </main>

      {showAddGym && (
        <AddGymModal 
          onSave={handleAddGym}
          onCancel={() => setShowAddGym(false)}
        />
      )}

      {showAddEquipment && selectedGym && (
        <AddEquipmentModal 
          gymId={selectedGym.id}
          onSave={handleAddEquipment}
          onCancel={() => setShowAddEquipment(false)}
        />
      )}
    </div>
  )
}

export default App
