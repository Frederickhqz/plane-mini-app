<template>
  <div class="project-page">
    <div v-if="loading" class="loading">Loading project...</div>
    
    <template v-else>
      <div class="project-header">
        <div class="project-icon" :style="{ background: getProjectColor(project?.identifier) }">
          {{ project?.identifier }}
        </div>
        <div>
          <h1>{{ project?.name }}</h1>
          <p>{{ project?.description }}</p>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ stats.issues }}</div>
          <div class="stat-label">Issues</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.cycles }}</div>
          <div class="stat-label">Cycles</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.modules }}</div>
          <div class="stat-label">Modules</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.completed }}</div>
          <div class="stat-label">Completed</div>
        </div>
      </div>
      
      <div class="section">
        <h2>Views</h2>
        <div class="view-options">
          <router-link :to="`/kanban/${projectId}`" class="view-card">
            <span class="view-icon">📋</span>
            <span>Kanban Board</span>
          </router-link>
          <router-link :to="`/issues/${projectId}`" class="view-card">
            <span class="view-icon">📝</span>
            <span>All Issues</span>
          </router-link>
        </div>
      </div>
      
      <div class="section" v-if="project?.cycle_view">
        <h2>Cycles</h2>
        <router-link :to="`/cycles/${projectId}`" class="section-link">
          View all cycles →
        </router-link>
      </div>
      
      <div class="section" v-if="project?.module_view">
        <h2>Modules</h2>
        <router-link :to="`/modules/${projectId}`" class="section-link">
          View all modules →
        </router-link>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../composables/api'

const route = useRoute()
const projectId = computed(() => route.params.id)

const loading = ref(true)
const project = ref(null)
const stats = ref({ issues: 0, cycles: 0, modules: 0, completed: 0 })

onMounted(async () => {
  try {
    const [projectData, issues, cycles, modules] = await Promise.all([
      api.getProject(projectId.value),
      api.getIssues(projectId.value),
      api.getCycles(projectId.value),
      api.getModules(projectId.value)
    ])
    project.value = projectData
    stats.value = {
      issues: issues.length,
      cycles: cycles.length,
      modules: modules.length,
      completed: issues.filter(i => i.state_group === 'completed').length
    }
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
</script>

<style scoped>
.project-page { padding: 16px; }

.project-header {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.project-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.project-header h1 { font-size: 20px; margin-bottom: 4px; }
.project-header p { font-size: 13px; opacity: 0.7; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--secondary-bg-color);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-value { font-size: 24px; font-weight: 700; color: var(--link-color); }
.stat-label { font-size: 11px; opacity: 0.6; margin-top: 4px; }

.section { margin-bottom: 24px; }
.section h2 { font-size: 16px; margin-bottom: 12px; }
.section-link { font-size: 14px; color: var(--link-color); }

.view-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }

.view-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: var(--secondary-bg-color);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
}

.view-icon { font-size: 32px; }
.view-card span:last-child { font-size: 13px; }
</style>