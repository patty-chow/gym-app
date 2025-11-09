// Storage utilities for persisting gym and equipment data
// Supports both localStorage and file-based storage

import type { Gym, Equipment, WorkoutExport } from './types';
import { fileStorage } from './fileStorage';

// Storage mode - can be 'localStorage' or 'file'
const STORAGE_MODE = (import.meta.env.VITE_STORAGE_MODE || 'localStorage') as 'localStorage' | 'file';

// Debug logging
console.log('🗄️ Storage Debug:');
console.log('VITE_STORAGE_MODE from env:', import.meta.env.VITE_STORAGE_MODE);
console.log('STORAGE_MODE resolved to:', STORAGE_MODE);
console.log('All env vars:', import.meta.env);

const GYMS_KEY = 'gym-app-gyms';
const EQUIPMENT_KEY = 'gym-app-equipment';

// LocalStorage implementation (original)
const localStorageImpl = {
  // Gym operations
  getGyms(): Gym[] {
    const stored = localStorage.getItem(GYMS_KEY);
    if (!stored) return [];
    
    const gyms = JSON.parse(stored);
    return gyms.map((gym: any) => ({
      ...gym,
      createdAt: new Date(gym.createdAt),
      updatedAt: new Date(gym.updatedAt)
    }));
  },

  saveGyms(gyms: Gym[]): void {
    localStorage.setItem(GYMS_KEY, JSON.stringify(gyms));
  },

  addGym(gym: Omit<Gym, 'id' | 'createdAt' | 'updatedAt'>): Gym {
    const gyms = this.getGyms();
    const newGym: Gym = {
      ...gym,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    gyms.push(newGym);
    this.saveGyms(gyms);
    return newGym;
  },

  updateGym(id: string, updates: Partial<Omit<Gym, 'id' | 'createdAt'>>): Gym | null {
    const gyms = this.getGyms();
    const index = gyms.findIndex(g => g.id === id);
    
    if (index === -1) return null;
    
    gyms[index] = {
      ...gyms[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveGyms(gyms);
    return gyms[index];
  },

  deleteGym(id: string): void {
    const gyms = this.getGyms().filter(g => g.id !== id);
    this.saveGyms(gyms);
    
    // Also delete all equipment for this gym
    const equipment = this.getEquipment().filter(e => e.gymId !== id);
    this.saveEquipment(equipment);
  },

  // Equipment operations
  getEquipment(): Equipment[] {
    const stored = localStorage.getItem(EQUIPMENT_KEY);
    if (!stored) return [];
    
    const equipment = JSON.parse(stored);
    return equipment.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    }));
  },

  getEquipmentByGym(gymId: string): Equipment[] {
    return this.getEquipment().filter(e => e.gymId === gymId);
  },

  saveEquipment(equipment: Equipment[]): void {
    localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(equipment));
  },

  addEquipment(equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Equipment {
    const allEquipment = this.getEquipment();
    const newEquipment: Equipment = {
      ...equipment,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    allEquipment.push(newEquipment);
    this.saveEquipment(allEquipment);
    return newEquipment;
  },

  updateEquipment(id: string, updates: Partial<Omit<Equipment, 'id' | 'createdAt'>>): Equipment | null {
    const equipment = this.getEquipment();
    const index = equipment.findIndex(e => e.id === id);
    
    if (index === -1) return null;
    
    equipment[index] = {
      ...equipment[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveEquipment(equipment);
    return equipment[index];
  },

  deleteEquipment(id: string): void {
    const equipment = this.getEquipment().filter(e => e.id !== id);
    this.saveEquipment(equipment);
  },

  // Export functionality
  exportData(): WorkoutExport {
    return {
      gyms: this.getGyms(),
      equipment: this.getEquipment(),
      exportDate: new Date(),
      notes: 'Gym equipment data export for workout planning'
    };
  },

  exportToJSON(): string {
    return JSON.stringify(this.exportData(), null, 2);
  },

  exportToChatGPTFormat(): string {
    const data = this.exportData();
    
    let output = `# My Gym Equipment Inventory\n\nExported on ${data.exportDate.toLocaleDateString()}\n\n`;
    
    data.gyms.forEach(gym => {
      output += `## ${gym.name}\n`;
      output += `**Address:** ${gym.address}\n`;
      if (gym.notes) output += `**Notes:** ${gym.notes}\n`;
      
      const gymEquipment = data.equipment.filter(e => e.gymId === gym.id && e.isAvailable);
      
      if (gymEquipment.length > 0) {
        output += `\n**Available Equipment:**\n`;
        
        // Group by category
        const groupedEquipment = gymEquipment.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {} as Record<string, Equipment[]>);
        
        Object.entries(groupedEquipment).forEach(([category, items]) => {
          output += `\n### ${category}\n`;
          items.forEach(item => {
            output += `- ${item.name}`;
            if (item.brand || item.model) {
              output += ` (${[item.brand, item.model].filter(Boolean).join(' ')})`;
            }
            if (item.notes) output += ` - ${item.notes}`;
            output += `\n`;
          });
        });
      } else {
        output += `\n*No equipment logged for this gym yet.*\n`;
      }
      
      output += `\n---\n\n`;
    });
    
    return output;
  }
};

// File storage adapter (async version)
const fileStorageAdapter = {
  // Initialize
  async init() {
    await fileStorage.init();
  },

  // Gym operations
  async getGyms(): Promise<Gym[]> {
    return await fileStorage.getGyms();
  },

  async saveGyms(gyms: Gym[]): Promise<void> {
    await fileStorage.saveGyms(gyms);
  },

  async addGym(gym: Omit<Gym, 'id' | 'createdAt' | 'updatedAt'>): Promise<Gym> {
    return await fileStorage.addGym(gym);
  },

  async updateGym(id: string, updates: Partial<Omit<Gym, 'id' | 'createdAt'>>): Promise<Gym | null> {
    return await fileStorage.updateGym(id, updates);
  },

  async deleteGym(id: string): Promise<void> {
    await fileStorage.deleteGym(id);
  },

  // Equipment operations
  async getEquipment(): Promise<Equipment[]> {
    return await fileStorage.getEquipment();
  },

  async getEquipmentByGym(gymId: string): Promise<Equipment[]> {
    return await fileStorage.getEquipmentByGym(gymId);
  },

  async saveEquipment(equipment: Equipment[]): Promise<void> {
    await fileStorage.saveEquipment(equipment);
  },

  async addEquipment(equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Equipment> {
    return await fileStorage.addEquipment(equipment);
  },

  async updateEquipment(id: string, updates: Partial<Omit<Equipment, 'id' | 'createdAt'>>): Promise<Equipment | null> {
    return await fileStorage.updateEquipment(id, updates);
  },

  async deleteEquipment(id: string): Promise<void> {
    await fileStorage.deleteEquipment(id);
  },

  // Export functionality
  async exportData(): Promise<WorkoutExport> {
    return await fileStorage.exportData();
  },

  async exportToJSON(): Promise<string> {
    return await fileStorage.exportToJSON();
  },

  async exportToChatGPTFormat(): Promise<string> {
    return await fileStorage.exportToChatGPTFormat();
  }
};

// Export the appropriate storage implementation
export const storage = STORAGE_MODE === 'file' ? fileStorageAdapter : localStorageImpl;
export const isFileStorage = STORAGE_MODE === 'file';

// Helper to migrate from localStorage to file storage
export async function migrateToFileStorage() {
  if (STORAGE_MODE === 'file') {
    console.log('Already using file storage');
    return;
  }

  console.log('Migrating from localStorage to file storage...');
  
  // Get data from localStorage
  const gyms = localStorageImpl.getGyms();
  const equipment = localStorageImpl.getEquipment();
  
  // Initialize file storage
  await fileStorage.init();
  
  // Save to file storage
  if (gyms.length > 0) {
    await fileStorage.saveGyms(gyms);
    console.log(`Migrated ${gyms.length} gyms`);
  }
  
  if (equipment.length > 0) {
    await fileStorage.saveEquipment(equipment);
    console.log(`Migrated ${equipment.length} equipment items`);
  }
  
  console.log('Migration complete!');
}
