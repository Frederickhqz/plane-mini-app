<template>
  <div class="issue-page">
    <div v-if="loading" class="loading">Loading issue...</div>
    
    <template v-else>
      <div class="issue-header">
        <span class="issue-id">{{ projectIdentifier }}-{{ issue.sequence_id }}</span>
        <span :class="['state-badge', issue.state_group]" :style="{ background: issue.state_color }">
          {{ issue.state_name }}
        </span>
      </div>
      
      <h1 class="issue-title">{{ issue.name }}</h1>
      
      <div class="issue-meta">
        <div class="meta-item">
          <span class="meta-label">Priority</span>
          <span :class="['priority-badge', issue.priority]">{{ issue.priority }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Created</span>
          <span>{{ formatDate(issue.created_at) }}</span>
        </div>
      </div>
      
      <div class="issue-description" v-if="issue.description">
        <h3>Description</h3>
        <p>{{ issue.description }}</p>
      </div>
      
      <div class="section">
        <h3>Change Status</h3>
        <div class="state-buttons">
          <button v-for="state in states" :key="state.id"
                  :class="['state-btn', { active: issue.state === state.id }]"
                  @click="changeState(state.id)">
            {{ state.name }}
          </button>
        </div>
      </div>
      
      <div class="section">
        <h3>Activity</h3>
        <div class="activity-timeline">
          <div class="activity-item">
            <span class="activity-icon">📝</span>
            <span>Created {{ formatDate(issue.created_at) }}</span>
          </div>
          <div class="activity-item" v-if="issue.completed_at">
            <span class="activity-icon">✅</span>
            <span>Completed {{ formatDate(issue.completed_at) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../composables/api'

const route = useRoute()
const router = useRouter()
const projectId = computed(() => route.params.projectId)
const issueId = computed(() => route.params.issueId)

const loading = ref(true)
const issue = ref({})
const states = ref([])
const projectIdentifier = ref('')

onMounted(async () => {
  try {
    const [issueData, statesData] = await Promise.all([
      api.getIssue(projectId.value, issueId.value),
      api.getStates(projectId.value)
    ])
    issue.value = issueData
    states.value = statesData
    
    // Get state info
    const state = statesData.find(s => s.id === issueData.state)
    issue.value.state_name = state?.name || 'Unknown'
    issue.value.state_group = state?.group || 'unknown'
    issue.value.state_color = state?.color || '#60646C'
    
    // Get project identifier
    const projects = await api.getProjects()
    const project = projects.find(p => p.id === projectId.value)
    projectIdentifier.value = project?.identifier || 'UNK'
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

async function changeState(stateId) {
  try {
    await api.updateIssue(projectId.value, issueId.value, { state: stateId })
    const state = states.value.find(s => s.id === stateId)
    issue.value.state = stateId
    issue.value.state_name = state?.name
    issue.value.state_group = state?.group
    issue.value.state_color = state?.color
  } catch (e) {
    console.error(e)
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.issue-page { padding: 16px; }

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.issue-id { font-family: monospace; font-size: 14px; opacity: 0.6; }

.state-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.issue-title { font-size: 20px; margin-bottom: 20px; line-height: 1.3; }

.issue-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label { font-size: 11px; opacity: 0.6; text-transform: uppercase; }

.priority-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  text-transform: capitalize;
}

.priority-badge.urgent { background: #ef4444; }
.priority-badge.high { background: #f97316; }
.priority-badge.medium { background: #eab308; color: #000; }
.priority-badge.low { background: #3b82f6; }
.priority-badge.none { background: #6b7280; }

.issue-description {
  background: var(--secondary-bg-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.issue-description h3 { font-size: 14px; margin-bottom: 8px; }
.issue-description p { font-size: 14px; line-height: 1.6; opacity: 0.9; }

.section { margin-bottom: 24px; }
.section h3 { font-size: 14px; margin-bottom: 12px; }

.state-buttons { display: flex; flex-wrap: wrap; gap: 8px; }

.state-btn {
  padding: 8px 16px;
  border: none;
  background: var(--secondary-bg-color);
  color: inherit;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}

.state-btn.active {
  background: var(--button-color);
  color: var(--button-text-color);
}

.activity-timeline {
  background: var(--secondary-bg-color);
  border-radius: 12px;
  padding: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  font-size: 13px;
}

.activity-icon { font-size: 16px; }
</style>