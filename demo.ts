#!/usr/bin/env tsx
// Demo script to show file storage and migration capabilities

import { storage, migrateToFileStorage } from './src/storage';

async function demo() {
  console.log('🏋️ Gym Equipment Logger - Storage Demo\n');

  // Add some sample data to localStorage first
  console.log('1. Adding sample data to localStorage...');
  
  const sampleGym = {
    name: 'Demo Fitness Center',
    address: '123 Workout Ave, Fitness City, FC 12345',
    notes: 'Sample gym for demonstration'
  };

  const sampleEquipment = [
    {
      gymId: '', // Will be set after gym creation
      name: 'Life Fitness Treadmill',
      category: 'Treadmill' as const,
      brand: 'Life Fitness',
      model: 'T3',
      notes: 'High-end cardio equipment',
      isAvailable: true
    },
    {
      gymId: '', // Will be set after gym creation
      name: 'Olympic Barbell',
      category: 'Barbell' as const,
      brand: 'Rogue',
      model: 'Ohio Bar',
      notes: '20kg Olympic barbell',
      isAvailable: true
    }
  ];

  try {
    // Add gym
    let gym;
    if ('then' in storage.addGym(sampleGym)) {
      gym = await storage.addGym(sampleGym);
    } else {
      gym = storage.addGym(sampleGym);
    }
    console.log(`✅ Added gym: ${gym.name}`);

    // Add equipment
    for (const equipData of sampleEquipment) {
      equipData.gymId = gym.id;
      let equipment;
      if ('then' in storage.addEquipment(equipData)) {
        equipment = await storage.addEquipment(equipData);
      } else {
        equipment = storage.addEquipment(equipData);
      }
      console.log(`✅ Added equipment: ${equipment.name}`);
    }

    // Show current data
    console.log('\n2. Current data:');
    let gyms, equipment;
    
    if ('then' in storage.getGyms()) {
      gyms = await storage.getGyms();
      equipment = await storage.getEquipment();
    } else {
      gyms = storage.getGyms();
      equipment = storage.getEquipment();
    }
    
    console.log(`📍 Gyms: ${gyms.length}`);
    console.log(`🏋️ Equipment: ${equipment.length}`);

    // Export data
    console.log('\n3. Exporting data...');
    let exportData;
    const exportResult = storage.exportToChatGPTFormat();
    if (exportResult instanceof Promise) {
      exportData = await exportResult;
    } else {
      exportData = exportResult;
    }
    
    console.log('📄 ChatGPT Export Preview:');
    console.log(exportData.slice(0, 200) + '...\n');

    // Demonstrate migration to file storage
    if (typeof migrateToFileStorage === 'function') {
      console.log('4. Migrating to file storage...');
      await migrateToFileStorage();
      console.log('✅ Migration completed!\n');
    }

    console.log('🎉 Demo completed successfully!');
    console.log('\nNext steps:');
    console.log('- Run `npm run dev` to start the web interface');
    console.log('- Run `npm run migrate:postgresql` to generate database migration scripts');
    console.log('- Check the `data/` directory for JSON files (if using file storage)');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

if (require.main === module) {
  demo();
}
