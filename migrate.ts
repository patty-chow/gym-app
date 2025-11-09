#!/usr/bin/env tsx
// Database migration script for gym equipment data
// This script can export JSON data to various database formats

import fs from 'fs/promises';
import path from 'path';
import type { Gym, Equipment } from './src/types';

const DATA_DIR = path.join(process.cwd(), 'data');

interface DatabaseConfig {
  type: 'mysql' | 'postgresql' | 'sqlite' | 'mongodb';
  outputFile?: string;
}

async function readJsonData() {
  const gymsFile = path.join(DATA_DIR, 'gyms.json');
  const equipmentFile = path.join(DATA_DIR, 'equipment.json');
  
  let gyms: Gym[] = [];
  let equipment: Equipment[] = [];
  
  try {
    const gymsData = await fs.readFile(gymsFile, 'utf-8');
    gyms = JSON.parse(gymsData);
    console.log(`📊 Found ${gyms.length} gyms`);
  } catch (error) {
    console.warn('No gyms file found or error reading it');
  }
  
  try {
    const equipmentData = await fs.readFile(equipmentFile, 'utf-8');
    equipment = JSON.parse(equipmentData);
    console.log(`🏋️ Found ${equipment.length} equipment items`);
  } catch (error) {
    console.warn('No equipment file found or error reading it');
  }
  
  return { gyms, equipment };
}

function generateMySQLScript(gyms: Gym[], equipment: Equipment[]): string {
  let sql = `-- MySQL migration script for gym equipment data
-- Generated on ${new Date().toISOString()}

-- Create database
CREATE DATABASE IF NOT EXISTS gym_equipment_db;
USE gym_equipment_db;

-- Create gyms table
CREATE TABLE IF NOT EXISTS gyms (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id VARCHAR(36) PRIMARY KEY,
    gym_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    notes TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
);

-- Clear existing data
DELETE FROM equipment;
DELETE FROM gyms;

-- Insert gyms
`;

  gyms.forEach(gym => {
    const escapedName = gym.name.replace(/'/g, "''");
    const escapedAddress = gym.address.replace(/'/g, "''");
    const escapedNotes = gym.notes ? gym.notes.replace(/'/g, "''") : null;
    
    sql += `INSERT INTO gyms (id, name, address, notes, created_at, updated_at) VALUES (
    '${gym.id}',
    '${escapedName}',
    '${escapedAddress}',
    ${escapedNotes ? `'${escapedNotes}'` : 'NULL'},
    '${gym.createdAt.toISOString().slice(0, 19).replace('T', ' ')}',
    '${gym.updatedAt.toISOString().slice(0, 19).replace('T', ' ')}'
);\n`;
  });

  sql += '\n-- Insert equipment\n';
  
  equipment.forEach(item => {
    const escapedName = item.name.replace(/'/g, "''");
    const escapedBrand = item.brand ? item.brand.replace(/'/g, "''") : null;
    const escapedModel = item.model ? item.model.replace(/'/g, "''") : null;
    const escapedNotes = item.notes ? item.notes.replace(/'/g, "''") : null;
    
    sql += `INSERT INTO equipment (id, gym_id, name, category, brand, model, notes, is_available, created_at, updated_at) VALUES (
    '${item.id}',
    '${item.gymId}',
    '${escapedName}',
    '${item.category}',
    ${escapedBrand ? `'${escapedBrand}'` : 'NULL'},
    ${escapedModel ? `'${escapedModel}'` : 'NULL'},
    ${escapedNotes ? `'${escapedNotes}'` : 'NULL'},
    ${item.isAvailable ? 'TRUE' : 'FALSE'},
    '${item.createdAt.toISOString().slice(0, 19).replace('T', ' ')}',
    '${item.updatedAt.toISOString().slice(0, 19).replace('T', ' ')}'
);\n`;
  });

  return sql;
}

function generatePostgreSQLScript(gyms: Gym[], equipment: Equipment[]): string {
  let sql = `-- PostgreSQL migration script for gym equipment data
-- Generated on ${new Date().toISOString()}

-- Create database (run this separately as superuser)
-- CREATE DATABASE gym_equipment_db;

-- Connect to the database first
-- \\c gym_equipment_db;

-- Enable UUID extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create gyms table
CREATE TABLE IF NOT EXISTS gyms (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY,
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    notes TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- Clear existing data
DELETE FROM equipment;
DELETE FROM gyms;

-- Insert gyms
`;

  gyms.forEach(gym => {
    const escapedName = gym.name.replace(/'/g, "''");
    const escapedAddress = gym.address.replace(/'/g, "''");
    const escapedNotes = gym.notes ? gym.notes.replace(/'/g, "''") : null;
    
    sql += `INSERT INTO gyms (id, name, address, notes, created_at, updated_at) VALUES (
    '${gym.id}',
    '${escapedName}',
    '${escapedAddress}',
    ${escapedNotes ? `'${escapedNotes}'` : 'NULL'},
    '${gym.createdAt.toISOString()}',
    '${gym.updatedAt.toISOString()}'
);\n`;
  });

  sql += '\n-- Insert equipment\n';
  
  equipment.forEach(item => {
    const escapedName = item.name.replace(/'/g, "''");
    const escapedBrand = item.brand ? item.brand.replace(/'/g, "''") : null;
    const escapedModel = item.model ? item.model.replace(/'/g, "''") : null;
    const escapedNotes = item.notes ? item.notes.replace(/'/g, "''") : null;
    
    sql += `INSERT INTO equipment (id, gym_id, name, category, brand, model, notes, is_available, created_at, updated_at) VALUES (
    '${item.id}',
    '${item.gymId}',
    '${escapedName}',
    '${item.category}',
    ${escapedBrand ? `'${escapedBrand}'` : 'NULL'},
    ${escapedModel ? `'${escapedModel}'` : 'NULL'},
    ${escapedNotes ? `'${escapedNotes}'` : 'NULL'},
    ${item.isAvailable},
    '${item.createdAt.toISOString()}',
    '${item.updatedAt.toISOString()}'
);\n`;
  });

  return sql;
}

function generateMongoDBScript(gyms: Gym[], equipment: Equipment[]): string {
  const gymDocs = gyms.map(gym => ({
    _id: gym.id,
    name: gym.name,
    address: gym.address,
    notes: gym.notes || null,
    createdAt: gym.createdAt,
    updatedAt: gym.updatedAt
  }));

  const equipmentDocs = equipment.map(item => ({
    _id: item.id,
    gymId: item.gymId,
    name: item.name,
    category: item.category,
    brand: item.brand || null,
    model: item.model || null,
    notes: item.notes || null,
    isAvailable: item.isAvailable,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));

  return `// MongoDB migration script for gym equipment data
// Generated on ${new Date().toISOString()}

// Switch to gym equipment database
use gym_equipment_db;

// Clear existing collections
db.gyms.deleteMany({});
db.equipment.deleteMany({});

// Insert gyms
db.gyms.insertMany(${JSON.stringify(gymDocs, null, 2)});

// Insert equipment
db.equipment.insertMany(${JSON.stringify(equipmentDocs, null, 2)});

// Create indexes for better performance
db.gyms.createIndex({ "name": 1 });
db.equipment.createIndex({ "gymId": 1 });
db.equipment.createIndex({ "category": 1 });
db.equipment.createIndex({ "isAvailable": 1 });

console.log("Migration completed!");
console.log("Gyms inserted:", ${gyms.length});
console.log("Equipment items inserted:", ${equipment.length});`;
}

async function migrate(config: DatabaseConfig) {
  console.log(`🚀 Starting migration to ${config.type.toUpperCase()}`);
  
  const { gyms, equipment } = await readJsonData();
  
  if (gyms.length === 0 && equipment.length === 0) {
    console.log('❌ No data found to migrate');
    return;
  }

  let script: string;
  let extension: string;
  
  switch (config.type) {
    case 'mysql':
      script = generateMySQLScript(gyms, equipment);
      extension = 'sql';
      break;
    case 'postgresql':
      script = generatePostgreSQLScript(gyms, equipment);
      extension = 'sql';
      break;
    case 'sqlite':
      // SQLite uses similar syntax to MySQL but with some differences
      script = generateMySQLScript(gyms, equipment)
        .replace('CREATE DATABASE IF NOT EXISTS gym_equipment_db;', '-- SQLite database will be created automatically')
        .replace('USE gym_equipment_db;', '-- Using SQLite database file');
      extension = 'sql';
      break;
    case 'mongodb':
      script = generateMongoDBScript(gyms, equipment);
      extension = 'js';
      break;
    default:
      throw new Error(`Unsupported database type: ${config.type}`);
  }

  const outputFile = config.outputFile || `migration_${config.type}.${extension}`;
  await fs.writeFile(outputFile, script, 'utf-8');
  
  console.log(`✅ Migration script generated: ${outputFile}`);
  console.log(`📄 Script contains ${gyms.length} gyms and ${equipment.length} equipment items`);
  
  // Log instructions
  console.log('\n📋 Next steps:');
  switch (config.type) {
    case 'mysql':
      console.log('1. Connect to MySQL: mysql -u username -p');
      console.log(`2. Run the script: source ${outputFile}`);
      break;
    case 'postgresql':
      console.log('1. Connect to PostgreSQL: psql -U username');
      console.log(`2. Run the script: \\i ${outputFile}`);
      break;
    case 'sqlite':
      console.log(`1. Create/connect to SQLite: sqlite3 gym_equipment.db`);
      console.log(`2. Run the script: .read ${outputFile}`);
      break;
    case 'mongodb':
      console.log('1. Connect to MongoDB: mongosh');
      console.log(`2. Run the script: load('${outputFile}')`);
      break;
  }
}

// CLI interface
const args = process.argv.slice(2);
const dbType = args[0] as DatabaseConfig['type'];
const outputFile = args[1];

if (!dbType || !['mysql', 'postgresql', 'sqlite', 'mongodb'].includes(dbType)) {
  console.log('Usage: tsx migrate.ts <database_type> [output_file]');
  console.log('Database types: mysql, postgresql, sqlite, mongodb');
  console.log('Example: tsx migrate.ts postgresql gym_migration.sql');
  process.exit(1);
}

migrate({ type: dbType, outputFile }).catch(console.error);
