import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const PLANE_API = 'http://168.231.69.92:54617/api/v1';
const API_KEY = 'plane_api_a671d43b3a7248108f522e8c6703aa85';

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key']
}));

// Parse JSON bodies
app.use(express.json());

// API proxy endpoint
app.get('/api/projects', async (req, res) => {
  try {
    const response = await fetch(`${PLANE_API}/workspaces/agents/projects/`, {
      headers: { 'X-API-Key': API_KEY }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/issues/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const [issuesRes, statesRes] = await Promise.all([
      fetch(`${PLANE_API}/workspaces/agents/projects/${projectId}/issues/`, {
        headers: { 'X-API-Key': API_KEY }
      }),
      fetch(`${PLANE_API}/workspaces/agents/projects/${projectId}/states/`, {
        headers: { 'X-API-Key': API_KEY }
      })
    ]);
    
    const issues = await issuesRes.json();
    const states = await statesRes.json();
    
    const stateMap = {};
    states.results?.forEach(s => {
      stateMap[s.id] = { name: s.name, group: s.group };
    });
    
    const enrichedIssues = (issues.results || []).map(issue => ({
      ...issue,
      state_name: stateMap[issue.state]?.name || 'Unknown',
      state_group: stateMap[issue.state]?.group || 'unknown'
    }));
    
    res.json({ ...issues, results: enrichedIssues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from dist/
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - serve index.html for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Plane Mini App running on port ${PORT}`);
});