// Test script to check storage mode and environment variables
console.log('Environment Variables:');
console.log('VITE_STORAGE_MODE:', import.meta.env.VITE_STORAGE_MODE);
console.log('NODE_ENV:', import.meta.env.NODE_ENV);
console.log('All env vars:', import.meta.env);

import { storage, isFileStorage } from './src/storage';

console.log('\nStorage Configuration:');
console.log('Is using file storage:', isFileStorage);
console.log('Storage type:', isFileStorage ? 'FILE' : 'LOCALSTORAGE');

// Test adding a gym to see which storage is used
async function testStorage() {
  console.log('\nTesting storage...');
  
  try {
    const testGym = {
      name: 'Debug Test Gym',
      address: '123 Debug Street',
      notes: 'This is a test gym to debug storage'
    };
    
    console.log('Adding test gym...');
    const result = await Promise.resolve(storage.addGym(testGym));
    console.log('Result:', result);
    
    console.log('Getting all gyms...');
    const allGyms = await Promise.resolve(storage.getGyms());
    console.log('All gyms:', allGyms);
    
  } catch (error) {
    console.error('Error testing storage:', error);
  }
}

testStorage();
