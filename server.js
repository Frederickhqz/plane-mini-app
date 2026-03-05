import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const HTTP_PORT = 3000;
const HTTPS_PORT = 3443;
const PLANE_API = 'http://168.231.69.92:54617/api/v1';
const API_KEY = 'plane_api_a671d43b3a7248108f522e8c6703aa85';
const WORKSPACE = 'agents';

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key']
}));

// Parse JSON bodies
app.use(express.json());

// Helper function for Plane API calls
async function planeFetch(endpoint, options = {}) {
  const url = `${PLANE_API}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ========== PROJECTS ==========
app.get('/api/projects', async (req, res) => {
  try {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/`);
    res.json(data);
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${req.params.id}/`);
    res.json(data);
  } catch (error) {
    console.error('Project error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/projects/:id', async (req, res) => {
  try {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${req.params.id}/`, {
      method: 'PATCH',
      body: JSON.stringify(req.body)
    });
    res.json(data);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ISSUES ==========
app.get('/api/issues/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const [issues, states] = await Promise.all([
      planeFetch(`/workspaces/${WORKSPACE}/projects/${projectId}/issues/`),
      planeFetch(`/workspaces/${WORKSPACE}/projects/${projectId}/states/`)
    ]);
    
    const stateMap = {};
    states.results?.forEach(s => {
      stateMap[s.id] = { name: s.name, group: s.group, color: s.color };
    });
    
    const enrichedIssues = (issues.results || []).map(issue => ({
      ...issue,
      state_name: stateMap[issue.state]?.name || 'Unknown',
      state_group: stateMap[issue.state]?.group || 'unknown',
      state_color: stateMap[issue.state]?.color || '#60646C'
    }));
    
    res.json({ ...issues, results: enrichedIssues });
  } catch (error) {
    console.error('Issues error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/issue/:projectId/:issueId', async (req, res) => {
  try {
    const { projectId, issueId } = req.params;
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${projectId}/issues/${issueId}/`);
    res.json(data);
  } catch (error) {
    console.error('Issue error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/issues/:projectId', async (req, res) => {
  try {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${req.params.projectId}/issues/`, {
      method: 'POST',
      body: JSON.stringify(req.body)
    });
    res.json(data);
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/issues/:projectId/:issueId', async (req, res) => {
  try {
    const { projectId, issueId } = req.params;
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${projectId}/issues/${issueId}/`, {
      method: 'PATCH',
      body: JSON.stringify(req.body)
    });
    res.json(data);
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== STATES ==========
app.get('/api/states/:projectId', async (req, res) => {
  try {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${req.params.projectId}/states/`);
    res.json(data);
  } catch (error) {
    console.error('States error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== CYCLES ==========
app.get('/api/cycles/:projectId', async (req, res) => {
  try {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${req.params.projectId}/cycles/`);
    res.json(data);
  } catch (error) {
    console.error('Cycles error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cycles/:projectId/:cycleId/issues', async (req, res) => {
  try {
    const { projectId, cycleId } = req.params;
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${projectId}/cycles/${cycleId}/cycle-issues/`);
    res.json(data);
  } catch (error) {
    console.error('Cycle issues error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cycles/:projectId', async (req, res) => {
  try {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${req.params.projectId}/cycles/`, {
      method: 'POST',
      body: JSON.stringify({ ...req.body, project_id: req.params.projectId })
    });
    res.json(data);
  } catch (error) {
    console.error('Create cycle error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== MODULES ==========
app.get('/api/modules/:projectId', async (req, res) => {
  try {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${req.params.projectId}/modules/`);
    res.json(data);
  } catch (error) {
    console.error('Modules error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/modules/:projectId/:moduleId/issues', async (req, res) => {
  try {
    const { projectId, moduleId } = req.params;
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${projectId}/modules/${moduleId}/module-issues/`);
    res.json(data);
  } catch (error) {
    console.error('Module issues error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/modules/:projectId', async (req, res) => {
  try {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${req.params.projectId}/modules/`, {
      method: 'POST',
      body: JSON.stringify(req.body)
    });
    res.json(data);
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== LABELS ==========
app.get('/api/labels/:projectId', async (req, res) => {
  try {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${req.params.projectId}/labels/`);
    res.json(data);
  } catch (error) {
    console.error('Labels error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from dist/
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - serve index.html for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start HTTP server
http.createServer(app).listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`🚀 Plane Mini App HTTP running on port ${HTTP_PORT}`);
});

// Start HTTPS server with self-signed certificates
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
};

https.createServer(sslOptions, app).listen(HTTPS_PORT, '0.0.0.0', () => {
  console.log(`🔒 Plane Mini App HTTPS running on port ${HTTPS_PORT}`);
});
