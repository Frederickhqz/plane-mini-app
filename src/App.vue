<template>
  <div class="app">
    <header class="header">
      <div class="logo">✈️ Plane Mini App</div>
      <div class="workspace">@agents</div>
    </header>

    <nav class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab', { active: currentTab === tab.id }]"
        @click="currentTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </nav>

    <main class="content">
      <div v-if="loading" class="loading">Loading... ⏳</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      
      <!-- Projects View -->
      <div v-else-if="currentTab === 'projects'" class="projects">
        <div v-for="project in projects" :key="project.id" class="project-card">
          <div class="project-header">
            <div class="project-icon" :style="{ background: getProjectColor(project.identifier) }">
              {{ project.identifier }}
            </div>
            <div class="project-info">
              <h3>{{ project.name }}</h3>
              <p>{{ project.description || 'No description' }}</p>
            </div>
          </div>
          <div class="project-stats">
            <span class="stat">{{ project.total_cycles || 0 }} cycles</span>
            <span class="stat">{{ project.total_modules || 0 }} modules</span>
          </div>
        </div>
      </div>

      <!-- Issues View -->
      <div v-else-if="currentTab === 'issues'" class="issues">
        <div v-if="loadingIssues" class="loading">Loading issues... ⏳</div>
        <div v-else>
          <div v-for="issue in issues" :key="issue.id" class="issue-card">
            <div class="issue-header">
              <span class="issue-id">{{ getProjectIdentifier(issue.project) }}-{{ issue.sequence_id }}</span>
              <span :class="['state-badge', issue.state_group]">{{ issue.state_name }}</span>
            </div>
            <h4>{{ issue.name }}</h4>
            <div class="issue-meta">
              <span>{{ formatDate(issue.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats View -->
      <div v-else-if="currentTab === 'stats'" class="stats">
        <div class="stat-card">
          <div class="stat-number">{{ projects.length }}</div>
          <div class="stat-label">Projects</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ issues.length }}</div>
          <div class="stat-label">Issues</div>
        </div>
      </div>
    </main>

    <footer class="footer">
      <div>Plane: 168.231.69.92:54617</div>
      <div v-if="lastUpdated">Updated: {{ lastUpdated }}</div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API_URL = '/api'
const WORKSPACE = 'agents'

const loading = ref(true)
const loadingIssues = ref(false)
const error = ref(null)
const projects = ref([])
const issues = ref([])
const currentTab = ref('projects')
const lastUpdated = ref(null)

const tabs = [
  { id: 'projects', name: 'Projects' },
  { id: 'issues', name: 'Issues' },
  { id: 'stats', name: 'Stats' }
]

async function fetchAPI(endpoint) {
  const response = await fetch(endpoint)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

async function loadData() {
  try {
    loading.value = true
    const data = await fetchAPI('/api/projects')
    projects.value = data.results || []
    lastUpdated.value = new Date().toLocaleTimeString()
  } catch (e) {
    error.value = 'Failed to load: ' + e.message
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadIssues() {
  if (issues.value.length > 0) return
  loadingIssues.value = true
  const allIssues = []
  
  for (const project of projects.value) {
    try {
      const data = await fetchAPI(`/api/issues/${project.id}`)
      allIssues.push(...(data.results || []))
    } catch (e) {
      console.error(`Failed to load issues for ${project.name}:`, e)
    }
  }
  
  issues.value = allIssues.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  loadingIssues.value = false
}

function getProjectColor(identifier) {
  const colors = { 'QRGEN': '#02b55c', 'CRM': '#e57a00', 'FRAME': '#02b5ed', 'AGENT': '#667eea' }
  return colors[identifier] || '#60646C'
}

function getProjectIdentifier(projectId) {
  const project = projects.value.find(p => p.id === projectId)
  return project?.identifier || 'UNK'
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

onMounted(() => {
  loadData()
})

// Watch for tab change to load issues
import { watch } from 'vue'
watch(currentTab, (newTab) => {
  if (newTab === 'issues') loadIssues()
})
</script>

<style scoped>
.app { min-height: 100vh; display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #fff; }
.header { padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.logo { font-size: 20px; font-weight: 700; }
.workspace { font-size: 12px; opacity: 0.8; margin-top: 4px; }
.tabs { display: flex; padding: 8px; background: rgba(255,255,255,0.05); gap: 8px; }
.tab { flex: 1; padding: 12px; border: none; background: rgba(255,255,255,0.1); color: inherit; border-radius: 8px; cursor: pointer; font-size: 14px; }
.tab.active { background: #667eea; }
.content { flex: 1; padding: 16px; overflow-y: auto; }
.loading, .error { text-align: center; padding: 40px; opacity: 0.7; }
.error { color: #ff6b6b; }
.project-card { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
.project-header { display: flex; gap: 12px; margin-bottom: 12px; }
.project-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0; }
.project-info h3 { font-size: 16px; margin-bottom: 4px; }
.project-info p { font-size: 12px; opacity: 0.7; line-height: 1.4; }
.project-stats { display: flex; gap: 12px; }
.stat { font-size: 12px; opacity: 0.6; }
.issue-card { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
.issue-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.issue-id { font-size: 12px; opacity: 0.5; font-family: monospace; }
.state-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase; }
.state-badge.backlog { background: #60646C; }
.state-badge.unstarted { background: #60646C; }
.state-badge.started { background: #F59E0B; color: #000; }
.state-badge.completed { background: #46A758; }
.issue-card h4 { font-size: 15px; margin-bottom: 8px; }
.issue-meta { display: flex; gap: 12px; font-size: 12px; opacity: 0.6; }
.stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.stat-card { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; text-align: center; }
.stat-number { font-size: 32px; font-weight: 700; color: #667eea; margin-bottom: 4px; }
.stat-label { font-size: 13px; opacity: 0.7; }
.footer { padding: 12px; text-align: center; font-size: 11px; opacity: 0.5; border-top: 1px solid rgba(255,255,255,0.1); }
</style>