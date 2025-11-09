// Core types for the gym equipment logging application

export interface Gym {
  id: string;
  name: string;
  address: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Equipment {
  id: string;
  gymId: string;
  name: string;
  category: EquipmentCategory;
  brand?: string;
  model?: string;
  notes?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const EquipmentCategory = {
  // Cardio Equipment
  TREADMILL: 'Treadmill',
  ELLIPTICAL: 'Elliptical',
  STATIONARY_BIKE: 'Stationary Bike',
  ROWING_MACHINE: 'Rowing Machine',
  STAIRMASTER: 'Stairmaster',
  
  // Free Weights
  BARBELL: 'Barbell',
  DUMBBELL: 'Dumbbell',
  KETTLEBELL: 'Kettlebell',
  WEIGHT_PLATES: 'Weight Plates',
  
  // Strength Machines
  LEG_PRESS: 'Leg Press',
  LAT_PULLDOWN: 'Lat Pulldown',
  CHEST_PRESS: 'Chest Press',
  SHOULDER_PRESS: 'Shoulder Press',
  LEG_CURL: 'Leg Curl',
  LEG_EXTENSION: 'Leg Extension',
  CABLE_MACHINE: 'Cable Machine',
  SMITH_MACHINE: 'Smith Machine',
  
  // Functional Training
  PULL_UP_BAR: 'Pull-up Bar',
  DIP_STATION: 'Dip Station',
  SQUAT_RACK: 'Squat Rack',
  POWER_RACK: 'Power Rack',
  BENCH: 'Bench',
  
  // Other
  OTHER: 'Other'
} as const

export type EquipmentCategory = typeof EquipmentCategory[keyof typeof EquipmentCategory]

export interface WorkoutExport {
  gyms: Gym[];
  equipment: Equipment[];
  exportDate: Date;
  notes?: string;
}
