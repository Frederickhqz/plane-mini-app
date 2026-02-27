<template>
  <div class="issues-page">
    <div class="filters">
      <select v-model="selectedProject" @change="loadIssues">
        <option value="">All Projects</option>
        <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </div>
    
    <div v-if="loading" class="loading">Loading issues...</div>
    
    <div v-else class="issue-list">
      <div v-for="issue in issues" :key="issue.id" class="issue-item" @click="openIssue(issue)">
        <div class="issue-main">
          <span class="issue-id">{{ issue.identifier || 'UNK' }}-{{ issue.sequence_id }}</span>
          <span class="issue-title">{{ issue.name }}</span>
        </div>
        <div class="issue-meta">
          <span :class="['state-badge', issue.state_group]" :style="{ background: issue.state_color }">
            {{ issue.state_name }}
          </span>
          <span v-if="issue.priority !== 'none'" :class="['priority', issue.priority]">
            {{ issue.priority }}
          </span>
        </div>
      </div>
      
      <div v-if="!issues.length" class="empty-state">
        No issues found
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../composables/api'

const route = useRoute()
const router = useRouter()

const projects = ref([])
const issues = ref([])
const selectedProject = ref(route.params.projectId || '')
const loading = ref(false)

onMounted(async () => {
  projects.value = await api.getProjects()
  if (selectedProject.value || projects.value.length === 1) {
    if (!selectedProject.value) selectedProject.value = projects.value[0].id
    loadIssues()
  } else {
    loadAllIssues()
  }
})

async function loadAllIssues() {
  loading.value = true
  const allIssues = []
  for (const project of projects.value) {
    try {
      const projectIssues = await api.getIssues(project.id)
      allIssues.push(...projectIssues.map(i => ({ ...i, identifier: project.identifier })))
    } catch (e) {}
  }
  issues.value = allIssues.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  loading.value = false
}

async function loadIssues() {
  if (!selectedProject.value) {
    loadAllIssues()
    return
  }
  
  loading.value = true
  try {
    const project = projects.value.find(p => p.id === selectedProject.value)
    issues.value = (await api.getIssues(selectedProject.value))
      .map(i => ({ ...i, identifier: project?.identifier }))
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

function openIssue(issue) {
  router.push(`/issue/${issue.project}/${issue.id}`)
}
</script>

<style scoped>
.issues-page { padding: 12px; }

.filters {
  margin-bottom: 16px;
}

.filters select {
  width: 100%;
  padding: 12px;
  background: var(--secondary-bg-color);
  border: none;
  color: inherit;
  border-radius: 8px;
  font-size: 14px;
}

.issue-item {
  background: var(--secondary-bg-color);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}

.issue-main {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.issue-id { font-size: 12px; opacity: 0.6; font-family: monospace; min-width: 60px; }
.issue-title { font-size: 14px; flex: 1; }

.issue-meta { display: flex; gap: 8px; }

.state-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  text-transform: uppercase;
}

.priority {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
}

.priority.urgent { background: #ef4444; }
.priority.high { background: #f97316; }
.priority.medium { background: #eab308; color: #000; }
.priority.low { background: #3b82f6; }
</style>