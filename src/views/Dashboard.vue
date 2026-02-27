<template>
  <div class="dashboard">
    <div class="hero">
      <div class="logo">✈️</div>
      <h1>Welcome to Plane</h1>
      <p>Manage projects, tasks, and workflows</p>
    </div>
    
    <div class="quick-actions">
      <router-link to="/projects" class="action-card" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
        <span class="action-icon">📁</span>
        <span class="action-label">Projects</span>
        <span class="action-count">{{ projects.length }}</span>
      </router-link>
      <router-link to="/issues" class="action-card" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
        <span class="action-icon">✅</span>
        <span class="action-label">All Tasks</span>
        <span class="action-count">{{ totalIssues }}</span>
      </router-link>
    </div>
    
    <div v-if="loading" class="loading">Loading...</div>
    
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div class="section" v-if="activeCycles.length">
      <h2>Active Cycles</h2>
      <div class="cycle-list">
        <div v-for="cycle in activeCycles" :key="cycle.id" class="cycle-card" 
             @click="openCycle(cycle)"
             @touchstart="handleTouchStart"
             @touchend="handleTouchEnd">
          <h3>{{ cycle.name }}</h3>
          <p>{{ cycle.projectName }}</p>
        </div>
      </div>
    </div>
    
    <div class="section" v-if="recentIssues.length">
      <h2>Recent Activity</h2>
      <div class="activity-list">
        <div v-for="issue in recentIssues" :key="issue.id" class="activity-item" 
             @click="openIssue(issue)"
             @touchstart="handleTouchStart"
             @touchend="handleTouchEnd">
          <span class="issue-id">{{ issue.identifier }}-{{ issue.sequence_id }}</span>
          <span class="issue-title">{{ issue.name }}</span>
          <span :class="['state-badge', issue.state_group]">{{ issue.state_name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../composables/api'

const router = useRouter()
const projects = ref([])
const issues = ref([])
const loading = ref(true)
const error = ref(null)
const activeCycles = ref([])

const totalIssues = computed(() => issues.value.length)
const recentIssues = computed(() => issues.value.slice(0, 5))

onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    projects.value = await api.getProjects()
    console.log('Dashboard loaded projects:', projects.value)
    
    const allIssues = []
    for (const project of projects.value) {
      try {
        const projectIssues = await api.getIssues(project.id)
        allIssues.push(...projectIssues.map(i => ({ ...i, identifier: project.identifier })))
      } catch (e) {
        console.warn(`Failed to load issues for project ${project.id}:`, e)
      }
    }
    issues.value = allIssues.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } catch (e) {
    console.error('Dashboard error:', e)
    error.value = 'Failed to load data: ' + e.message
  } finally {
    loading.value = false
  }
})

function openIssue(issue) {
  router.push(`/issue/${issue.project}/${issue.id}`)
}

function openCycle(cycle) {
  router.push(`/cycles/${cycle.projectId}`)
}

function handleTouchStart(e) {
  e.currentTarget.style.opacity = '0.7'
}

function handleTouchEnd(e) {
  e.currentTarget.style.opacity = '1'
}
</script>

<style scoped>
.dashboard { padding: 16px; }

.hero {
  text-align: center;
  padding: 32px 16px;
}

.logo { font-size: 48px; margin-bottom: 16px; }
.hero h1 { font-size: 24px; margin-bottom: 8px; }
.hero p { opacity: 0.7; font-size: 14px; }

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: var(--secondary-bg-color);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  transition: opacity 0.1s, transform 0.1s;
}

.action-card:active {
  opacity: 0.7;
  transform: scale(0.98);
}

.action-icon { font-size: 32px; margin-bottom: 8px; }
.action-label { font-size: 14px; font-weight: 500; }
.action-count { font-size: 12px; opacity: 0.6; margin-top: 4px; }

.section { margin-bottom: 24px; }
.section h2 { font-size: 16px; margin-bottom: 12px; padding: 0 4px; }

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--secondary-bg-color);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  transition: opacity 0.1s, transform 0.1s;
}

.activity-item:active {
  opacity: 0.7;
  transform: scale(0.98);
}

.issue-id { font-family: monospace; font-size: 12px; opacity: 0.6; min-width: 60px; }
.issue-title { flex: 1; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.state-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  text-transform: uppercase;
}

.state-badge.started { background: #F59E0B; color: #000; }
.state-badge.completed { background: #46A758; }
.state-badge.backlog, .state-badge.unstarted { background: #60646C; }

.cycle-card {
  padding: 16px;
  background: var(--secondary-bg-color);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  transition: opacity 0.1s, transform 0.1s;
}

.cycle-card:active {
  opacity: 0.7;
  transform: scale(0.98);
}

.cycle-card h3 { font-size: 14px; margin-bottom: 4px; }
.cycle-card p { font-size: 12px; opacity: 0.6; }

.error {
  padding: 20px;
  text-align: center;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  margin-bottom: 16px;
}
</style>
