# Gym Equipment Logger

A modern web application for logging and managing gym equipment across different gyms, designed to help you create better workout plans based on available equipment.

## Features

### 🏋️ Gym Management
- Add multiple gym locations with addresses and notes
- Switch between different gyms
- Delete gyms and associated equipment

### 🔧 Equipment Tracking
- Log equipment by category (Cardio, Free Weights, Strength Machines, etc.)
- Track equipment availability
- Add detailed information including brand, model, and notes
- Organize equipment by categories for easy browsing

### 🗄️ Flexible Data Storage
- **localStorage**: Default browser-based storage (no setup required)
- **File Storage**: JSON files with backend API for better data control
- **Database Migration**: Export to MySQL, PostgreSQL, SQLite, or MongoDB

### 📊 Export for Workout Planning
- **Export for ChatGPT**: Generate a markdown file formatted specifically for ChatGPT to create workout plans
- **Export JSON**: Export raw data for other applications or backup

## How to Use

1. **Add Your First Gym**: Click the "+" button in the sidebar to add a gym location
2. **Add Equipment**: Select a gym and click "Add Equipment" to log available machines
3. **Manage Availability**: Toggle equipment availability with the eye icon
4. **Export Data**: Use the export buttons in the header to generate workout planning files

## Export Format for ChatGPT

The app generates a well-formatted markdown file that you can copy and paste into ChatGPT with prompts like:

> "Based on my available gym equipment below, create a 3-day full-body workout plan for building muscle:"

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development
- **Lucide React** for icons
- **Local Storage** for data persistence
- **Modern CSS** with responsive design

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gym-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Equipment Categories

The app supports the following equipment categories:

**Cardio Equipment:**
- Treadmill, Elliptical, Stationary Bike, Rowing Machine, Stairmaster

**Free Weights:**
- Barbell, Dumbbell, Kettlebell, Weight Plates

**Strength Machines:**
- Leg Press, Lat Pulldown, Chest Press, Shoulder Press, Leg Curl, Leg Extension, Cable Machine, Smith Machine

**Functional Training:**
- Pull-up Bar, Dip Station, Squat Rack, Power Rack, Bench

## Data Storage

All data is stored locally in your browser's localStorage. Your gym and equipment data will persist between sessions, but it's recommended to export your data periodically for backup.

## Storage Options

### localStorage Mode (Default)
Data is stored in your browser's localStorage. No setup required.

### File Storage Mode
Store data in JSON files with a backend API for better data management.

1. Set environment variable:
```bash
# In .env file
VITE_STORAGE_MODE=file
```

2. Start with backend:
```bash
npm run dev:full  # Starts both frontend and backend
```

The backend API runs on http://localhost:3001 and stores data in JSON files in the `data/` directory.

## Database Migration

Easily migrate your data to any major database system:

### Export to Database
```bash
# Generate MySQL migration script
npm run migrate:mysql

# Generate PostgreSQL migration script  
npm run migrate:postgresql

# Generate SQLite migration script
npm run migrate:sqlite

# Generate MongoDB migration script
npm run migrate:mongodb
```

### Custom Migration
```bash
# Specify output file
tsx migrate.ts postgresql my_gym_db.sql
tsx migrate.ts mongodb gym_migration.js
```

The migration scripts include:
- Complete database schema creation
- Data insertion with proper escaping
- Indexes for optimal performance
- Step-by-step instructions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
