// Simple Express server to handle file operations for gym equipment storage
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(process.cwd(), 'data');

app.use(cors());
app.use(express.json());

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// API Routes

// Ensure directory exists
app.post('/api/ensure-dir', async (req, res) => {
  try {
    await ensureDataDir();
    res.json({ success: true });
  } catch (error) {
    console.error('Error ensuring directory:', error);
    res.status(500).json({ error: 'Could not create directory' });
  }
});

// Read file
app.get('/api/read-file', async (req, res) => {
  try {
    const filename = req.query.file as string;
    const filePath = path.join(DATA_DIR, filename);
    
    const data = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(data);
    
    res.json(jsonData);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'File not found' });
    } else {
      console.error('Error reading file:', error);
      res.status(500).json({ error: 'Could not read file' });
    }
  }
});

// Write file
app.post('/api/write-file', async (req, res) => {
  try {
    const { file, data } = req.body;
    const filePath = path.join(DATA_DIR, file);
    
    await ensureDataDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: 'Could not write file' });
  }
});

// List all data files (useful for database migration)
app.get('/api/list-files', async (req, res) => {
  try {
    await ensureDataDir();
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const fileData = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(DATA_DIR, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime
        };
      })
    );
    
    res.json(fileData);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Could not list files' });
  }
});

// Get all data (useful for database migration)
app.get('/api/export-all', async (req, res) => {
  try {
    await ensureDataDir();
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const allData: Record<string, any> = {};
    
    for (const file of jsonFiles) {
      const filePath = path.join(DATA_DIR, file);
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(data);
        const key = file.replace('.json', '');
        allData[key] = jsonData;
      } catch (error) {
        console.warn(`Could not read ${file}:`, error);
        allData[file] = null;
      }
    }
    
    res.json(allData);
  } catch (error) {
    console.error('Error exporting all data:', error);
    res.status(500).json({ error: 'Could not export data' });
  }
});

// Start server
async function startServer() {
  await ensureDataDir();
  
  app.listen(PORT, () => {
    console.log(`🚀 File storage API running on http://localhost:${PORT}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
  });
}

startServer().catch(console.error);
