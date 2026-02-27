<template>
  <div class="kanban-page">
    <div v-if="loading" class="loading">Loading board...</div>
    
    <div v-else class="kanban-board">
      <div v-for="state in states" :key="state.id" class="kanban-column">
        <div class="column-header">
          <span class="column-dot" :style="{ background: state.color }"></span>
          <span class="column-name">{{ state.name }}</span>
          <span class="column-count">{{ getIssuesForState(state.id).length }}</span>
        </div>
        
        <div class="column-issues">
          <div v-for="issue in getIssuesForState(state.id)" 
               :key="issue.id" 
               class="issue-card"
               draggable="true"
               @dragstart="dragStart($event, issue)"
               @dragover.prevent
               @drop="drop($event, state.id)">
            <div class="issue-header">
              <span class="issue-id">{{ projectIdentifier }}-{{ issue.sequence_id }}</span>
            </div>
            <h4>{{ issue.name }}</h4>
            <div class="issue-footer">
              <span v-if="issue.priority !== 'none'" :class="['priority-badge', issue.priority]">
                {{ issue.priority }}
              </span>
            </div>
          </div>
          
          <div class="drop-zone"
               @dragover.prevent
               @drop="drop($event, state.id)">
            Drop here
          </div>
        </div>
      </div>
    </div>
    
    <button class="fab" @click="showNewIssue = true">+</button>
    
    <div v-if="showNewIssue" class="modal-overlay" @click="showNewIssue = false">
      <div class="modal" @click.stop>
        <h3>Create Issue</h3>
        <input v-model="newIssue.name" placeholder="Issue title" class="input" />
        <textarea v-model="newIssue.description" placeholder="Description" class="input"></textarea>
        <select v-model="newIssue.state" class="input">
          <option v-for="s in states" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <button class="btn btn-primary" @click="createIssue">Create</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../composables/api'

const route = useRoute()
const router = useRouter()
const projectId = computed(() => route.params.projectId)

const loading = ref(true)
const project = ref(null)
const states = ref([])
const issues = ref([])
const showNewIssue = ref(false)
const draggedIssue = ref(null)

const projectIdentifier = computed(() => project.value?.identifier || '')

const newIssue = ref({ name: '', description: '', state: '' })

onMounted(async () => {
  try {
    const [projectData, statesData, issuesData] = await Promise.all([
      api.getProject(projectId.value),
      api.getStates(projectId.value),
      api.getIssues(projectId.value)
    ])
    project.value = projectData
    states.value = statesData.sort((a, b) => (a.group === 'backlog' ? -1 : 1))
    issues.value = issuesData
    if (states.value.length) newIssue.value.state = states.value[0].id
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

function getIssuesForState(stateId) {
  return issues.value.filter(i => i.state === stateId)
}

function dragStart(e, issue) {
  draggedIssue.value = issue
  e.dataTransfer.effectAllowed = 'move'
}

async function drop(e, newStateId) {
  if (!draggedIssue.value) return
  
  const issue = draggedIssue.value
  const oldState = issue.state
  
  // Optimistic update
  issue.state = newStateId
  
  try {
    await api.updateIssue(projectId.value, issue.id, { state: newStateId })
  } catch (e) {
    issue.state = oldState
    console.error(e)
  }
  
  draggedIssue.value = null
}

async function createIssue() {
  if (!newIssue.value.name) return
  
  try {
    const issue = await api.createIssue(projectId.value, newIssue.value)
    issues.value.push(issue)
    showNewIssue.value = false
    newIssue.value = { name: '', description: '', state: states.value[0]?.id }
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.kanban-page { height: calc(100vh - 130px); overflow-x: auto; }

.kanban-board {
  display: flex;
  gap: 12px;
  padding: 12px;
  min-height: 100%;
}

.kanban-column {
  min-width: 280px;
  background: var(--secondary-bg-color);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.column-dot { width: 12px; height: 12px; border-radius: 50%; }
.column-name { flex: 1; font-weight: 600; font-size: 14px; }
.column-count { font-size: 12px; opacity: 0.6; }

.column-issues {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  min-height: 100px;
}

.issue-card {
  background: var(--bg-color);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: grab;
}

.issue-card:active { cursor: grabbing; }

.issue-header { margin-bottom: 8px; }
.issue-id { font-size: 11px; opacity: 0.5; font-family: monospace; }
.issue-card h4 { font-size: 13px; line-height: 1.4; margin-bottom: 8px; }
.issue-footer { display: flex; gap: 8px; }

.priority-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
}

.priority-badge.urgent { background: #ef4444; }
.priority-badge.high { background: #f97316; }
.priority-badge.medium { background: #eab308; color: #000; }
.priority-badge.low { background: #3b82f6; }

.drop-zone {
  border: 2px dashed rgba(255,255,255,0.2);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  opacity: 0.3;
  font-size: 12px;
}

.fab {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--button-color);
  color: var(--button-text-color);
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
}

.modal {
  background: var(--secondary-bg-color);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
}

.modal h3 { margin-bottom: 16px; }

.input {
  width: 100%;
  padding: 12px;
  border: none;
  background: var(--bg-color);
  color: inherit;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

textarea.input { min-height: 80px; resize: vertical; }
</style>