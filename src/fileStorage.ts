// File-based storage utilities for persisting gym and equipment data
// This stores data in JSON files instead of localStorage

import type { Gym, Equipment, WorkoutExport } from './types';

const DATA_DIR = 'data';
const GYMS_FILE = `${DATA_DIR}/gyms.json`;
const EQUIPMENT_FILE = `${DATA_DIR}/equipment.json`;

// Utility to ensure data directory exists
async function ensureDataDir() {
  try {
    await fetch('/api/ensure-dir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dir: DATA_DIR })
    });
  } catch (error) {
    console.warn('Could not ensure data directory exists:', error);
  }
}

// Utility to read JSON file
async function readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
  try {
    const response = await fetch(`/api/read-file?file=${encodeURIComponent(filename)}`);
    if (!response.ok) {
      if (response.status === 404) {
        return defaultValue;
      }
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`Could not read ${filename}:`, error);
    return defaultValue;
  }
}

// Utility to write JSON file
async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  try {
    await fetch('/api/write-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: filename, data })
    });
  } catch (error) {
    console.error(`Could not write ${filename}:`, error);
    throw error;
  }
}

export const fileStorage = {
  // Initialize storage
  async init() {
    await ensureDataDir();
  },

  // Gym operations
  async getGyms(): Promise<Gym[]> {
    const gyms = await readJsonFile<any[]>(GYMS_FILE, []);
    return gyms.map((gym: any) => ({
      ...gym,
      createdAt: new Date(gym.createdAt),
      updatedAt: new Date(gym.updatedAt)
    }));
  },

  async saveGyms(gyms: Gym[]): Promise<void> {
    await writeJsonFile(GYMS_FILE, gyms);
  },

  async addGym(gym: Omit<Gym, 'id' | 'createdAt' | 'updatedAt'>): Promise<Gym> {
    const gyms = await this.getGyms();
    const newGym: Gym = {
      ...gym,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    gyms.push(newGym);
    await this.saveGyms(gyms);
    return newGym;
  },

  async updateGym(id: string, updates: Partial<Omit<Gym, 'id' | 'createdAt'>>): Promise<Gym | null> {
    const gyms = await this.getGyms();
    const index = gyms.findIndex(g => g.id === id);
    
    if (index === -1) return null;
    
    gyms[index] = {
      ...gyms[index],
      ...updates,
      updatedAt: new Date()
    };
    
    await this.saveGyms(gyms);
    return gyms[index];
  },

  async deleteGym(id: string): Promise<void> {
    const gyms = await this.getGyms();
    const filteredGyms = gyms.filter(g => g.id !== id);
    await this.saveGyms(filteredGyms);
    
    // Also delete all equipment for this gym
    const equipment = await this.getEquipment();
    const filteredEquipment = equipment.filter(e => e.gymId !== id);
    await this.saveEquipment(filteredEquipment);
  },

  // Equipment operations
  async getEquipment(): Promise<Equipment[]> {
    const equipment = await readJsonFile<any[]>(EQUIPMENT_FILE, []);
    return equipment.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    }));
  },

  async getEquipmentByGym(gymId: string): Promise<Equipment[]> {
    const equipment = await this.getEquipment();
    return equipment.filter(e => e.gymId === gymId);
  },

  async saveEquipment(equipment: Equipment[]): Promise<void> {
    await writeJsonFile(EQUIPMENT_FILE, equipment);
  },

  async addEquipment(equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Equipment> {
    const allEquipment = await this.getEquipment();
    const newEquipment: Equipment = {
      ...equipment,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    allEquipment.push(newEquipment);
    await this.saveEquipment(allEquipment);
    return newEquipment;
  },

  async updateEquipment(id: string, updates: Partial<Omit<Equipment, 'id' | 'createdAt'>>): Promise<Equipment | null> {
    const equipment = await this.getEquipment();
    const index = equipment.findIndex(e => e.id === id);
    
    if (index === -1) return null;
    
    equipment[index] = {
      ...equipment[index],
      ...updates,
      updatedAt: new Date()
    };
    
    await this.saveEquipment(equipment);
    return equipment[index];
  },

  async deleteEquipment(id: string): Promise<void> {
    const equipment = await this.getEquipment();
    const filtered = equipment.filter(e => e.id !== id);
    await this.saveEquipment(filtered);
  },

  // Export functionality
  async exportData(): Promise<WorkoutExport> {
    return {
      gyms: await this.getGyms(),
      equipment: await this.getEquipment(),
      exportDate: new Date(),
      notes: 'Gym equipment data export for workout planning'
    };
  },

  async exportToJSON(): Promise<string> {
    const data = await this.exportData();
    return JSON.stringify(data, null, 2);
  },

  async exportToChatGPTFormat(): Promise<string> {
    const data = await this.exportData();
    
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
