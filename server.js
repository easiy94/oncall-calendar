import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());

// Adatok betöltése a fájlból
const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Hiba az adatok olvasásakor:', err);
  }
  return null;
};

// Adatok mentése a fájlba
const saveData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Hiba az adatok mentésekor:', err);
  }
};

// API: adatok lekérése
app.get('/api/data', (req, res) => {
  const data = loadData();
  res.json(data || { teams: {}, currentTeamId: 'arany' });
});

// API: adatok mentése
app.post('/api/data', (req, res) => {
  const { teams, currentTeamId } = req.body;
  saveData({ teams, currentTeamId });
  res.json({ success: true });
});

// Statikus fájlok kiszolgálása (a lefordított React app)
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`A szerver fut a http://localhost:${PORT} címen`);
});