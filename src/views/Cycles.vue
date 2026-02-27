<template>
  <div class="cycles-page">
    <div v-if="loading" class="loading">Loading cycles...</div>
    
    <div v-else>
      <div v-if="cycles.length === 0" class="empty-state">
        <p>No cycles yet</p>
        <button class="btn btn-primary" @click="showCreate = true">Create Cycle</button>
      </div>
      
      <div v-else class="cycle-list">
        <div v-for="cycle in cycles" :key="cycle.id" class="cycle-card">
          <div class="cycle-header">
            <h3>{{ cycle.name }}</h3>
            <span :class="['cycle-status', cycleStatus(cycle)]">{{ cycleStatus(cycle) }}</span>
          </div>
          <p v-if="cycle.description">{{ cycle.description }}</p>
          <div class="cycle-dates">
            <span v-if="cycle.start_date">📍 {{ cycle.start_date }}</span>
            <span v-if="cycle.end_date">🎯 {{ cycle.end_date }}</span>
          </div>
        </div>
      </div>
      
      <button class="fab" @click="showCreate = true">+</button>
    </div>
    
    <div v-if="showCreate" class="modal-overlay" @click="showCreate = false">
      <div class="modal" @click.stop>
        <h3>Create Cycle</h3>
        <input v-model="newCycle.name" placeholder="Cycle name" class="input" />
        <textarea v-model="newCycle.description" placeholder="Description" class="input"></textarea>
        <button class="btn btn-primary" @click="createCycle">Create</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../composables/api'

const route = useRoute()
const projectId = computed(() => route.params.projectId)

const loading = ref(true)
const cycles = ref([])
const showCreate = ref(false)
const newCycle = ref({ name: '', description: '' })

onMounted(async () => {
  try {
    cycles.value = await api.getCycles(projectId.value)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

function cycleStatus(cycle) {
  if (!cycle.start_date) return 'draft'
  const now = new Date()
  const start = new Date(cycle.start_date)
  const end = cycle.end_date ? new Date(cycle.end_date) : null
  
  if (now < start) return 'upcoming'
  if (end && now > end) return 'completed'
  return 'active'
}

async function createCycle() {
  if (!newCycle.value.name) return
  
  try {
    const cycle = await api.createCycle(projectId.value, newCycle.value)
    cycles.value.push(cycle)
    showCreate.value = false
    newCycle.value = { name: '', description: '' }
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.cycles-page { padding: 12px; }

.cycle-card {
  background: var(--secondary-bg-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.cycle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.cycle-header h3 { font-size: 16px; }

.cycle-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  text-transform: uppercase;
}

.cycle-status.active { background: #46A758; }
.cycle-status.upcoming { background: #3b82f6; }
.cycle-status.completed { background: #60646C; }
.cycle-status.draft { background: #9CA3AF; }

.cycle-card p { font-size: 13px; opacity: 0.7; margin-bottom: 8px; }

.cycle-dates {
  display: flex;
  gap: 16px;
  font-size: 12px;
  opacity: 0.6;
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
</style>