<template>
  <div class="projects-page">
    <div v-if="loading" class="loading">Loading projects...</div>
    
    <div v-else class="project-list">
      <div v-for="project in projects" :key="project.id" 
           class="project-card" @click="openProject(project)">
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
          <button class="action-btn" @click.stop="openKanban(project)">Kanban</button>
          <button class="action-btn" @click.stop="openCycles(project)">Cycles</button>
          <button class="action-btn" @click.stop="openModules(project)">Modules</button>
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

onMounted(async () => {
  try {
    projects.value = await api.getProjects()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

function getProjectColor(identifier) {
  const colors = { QRGEN: '#02b55c', CRM: '#e57a00', FRAME: '#02b5ed', AGENT: '#667eea' }
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
</script>

<style scoped>
.projects-page { padding: 12px; }

.project-card {
  background: var(--secondary-bg-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
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
}
</style>