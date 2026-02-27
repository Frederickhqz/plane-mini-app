<template>
  <div class="projects-page">
    <div v-if="loading" class="loading">Loading projects...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="projects.length === 0" class="empty-state">No projects found</div>
    
    <div v-else class="project-list">
      <div v-for="project in projects" :key="project.id" 
           class="project-card" 
           @click="openProject(project)"
           @touchstart="handleTouchStart"
           @touchend="handleTouchEnd">
        <div class="project-header">
          <div class="project-icon" :style="{ background: getProjectColor(project.identifier) }">
            {{ project.identifier }}
          </div>
          <div class="project-info">
            <h3>{{ project.name }}</h3>
            <p>{{ project.description || 'No description' }}</p>
          </div>
        </div>
        <div class="project-meta">
          <span v-if="project.total_cycles">🔄 {{ project.total_cycles }} cycles</span>
          <span v-if="project.total_modules">📦 {{ project.total_modules }} modules</span>
        </div>
        <div class="project-actions">
          <button class="action-btn" 
                  @click.stop="openKanban(project)"
                  @touchstart.stop="handleTouchStart"
                  @touchend.stop="handleTouchEnd">Kanban</button>
          <button class="action-btn" 
                  @click.stop="openCycles(project)"
                  @touchstart.stop="handleTouchStart"
                  @touchend.stop="handleTouchEnd">Cycles</button>
          <button class="action-btn" 
                  @click.stop="openModules(project)"
                  @touchstart.stop="handleTouchStart"
                  @touchend.stop="handleTouchEnd">Modules</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../composables/api'

const router = useRouter()
const projects = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    projects.value = await api.getProjects()
    console.log('Loaded projects:', projects.value)
  } catch (e) {
    console.error('Failed to load projects:', e)
    error.value = 'Failed to load projects: ' + e.message
  } finally {
    loading.value = false
  }
})

function getProjectColor(identifier) {
  const colors = { QRGEN: '#02b55c', CRM: '#e57a00', FRAME: '#02b5ed', AGENT: '#667eea', ORCH: '#9b59b6' }
  return colors[identifier] || '#60646C'
}

function openProject(project) {
  router.push(`/project/${project.id}`)
}

function openKanban(project) {
  router.push(`/kanban/${project.id}`)
}

function openCycles(project) {
  router.push(`/cycles/${project.id}`)
}

function openModules(project) {
  router.push(`/modules/${project.id}`)
}

// Touch event handlers for better mobile responsiveness
function handleTouchStart(e) {
  e.currentTarget.style.opacity = '0.7'
}

function handleTouchEnd(e) {
  e.currentTarget.style.opacity = '1'
}
</script>

<style scoped>
.projects-page { padding: 12px; }

.project-card {
  background: var(--secondary-bg-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  transition: transform 0.1s, opacity 0.1s;
}

.project-card:active {
  transform: scale(0.98);
}

.project-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.project-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
  color: white;
}

.project-info h3 { font-size: 16px; margin-bottom: 4px; }
.project-info p { font-size: 12px; opacity: 0.7; line-height: 1.4; }

.project-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
  opacity: 0.6;
}

.project-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: rgba(102, 126, 234, 0.2);
  color: var(--link-color);
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  transition: opacity 0.1s, transform 0.1s;
}

.action-btn:active {
  opacity: 0.7;
  transform: scale(0.95);
}

.error {
  padding: 40px;
  text-align: center;
  color: #ef4444;
}

.empty-state {
  padding: 40px;
  text-align: center;
  opacity: 0.6;
}
</style>
