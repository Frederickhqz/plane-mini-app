<template>
  <div class="modules-page">
    <div v-if="loading" class="loading">Loading modules...</div>
    
    <div v-else>
      <div v-if="modules.length === 0" class="empty-state">
        <p>No modules yet</p>
        <button class="btn btn-primary" @click="showCreate = true">Create Module</button>
      </div>
      
      <div v-else class="module-list">
        <div v-for="module in modules" :key="module.id" class="module-card">
          <div class="module-header">
            <h3>{{ module.name }}</h3>
            <span :class="['module-status', module.status]">{{ module.status }}</span>
          </div>
          <p v-if="module.description">{{ module.description }}</p>
          <div class="module-progress" v-if="module.progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${module.progress}%` }"></div>
            </div>
            <span>{{ module.progress }}% complete</span>
          </div>
        </div>
      </div>
      
      <button class="fab" @click="showCreate = true">+</button>
    </div>
    
    <div v-if="showCreate" class="modal-overlay" @click="showCreate = false">
      <div class="modal" @click.stop>
        <h3>Create Module</h3>
        <input v-model="newModule.name" placeholder="Module name" class="input" />
        <textarea v-model="newModule.description" placeholder="Description" class="input"></textarea>
        <button class="btn btn-primary" @click="createModule">Create</button>
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
const modules = ref([])
const showCreate = ref(false)
const newModule = ref({ name: '', description: '' })

onMounted(async () => {
  try {
    modules.value = await api.getModules(projectId.value)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

async function createModule() {
  if (!newModule.value.name) return
  
  try {
    const module = await api.createModule(projectId.value, newModule.value)
    modules.value.push(module)
    showCreate.value = false
    newModule.value = { name: '', description: '' }
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.modules-page { padding: 12px; }

.module-card {
  background: var(--secondary-bg-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.module-header h3 { font-size: 16px; }

.module-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  text-transform: uppercase;
}

.module-status.planned { background: #60646C; }
.module-status.in_progress { background: #F59E0B; color: #000; }
.module-status.completed { background: #46A758; }
.module-status.paused { background: #9CA3AF; }

.module-card p { font-size: 13px; opacity: 0.7; margin-bottom: 12px; }

.module-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--link-color);
  border-radius: 3px;
  transition: width 0.3s;
}

.module-progress span { font-size: 12px; opacity: 0.6; }

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