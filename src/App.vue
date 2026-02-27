<template>
  <div class="app" :style="themeStyles">
    <header class="header" v-if="$route.name !== 'dashboard'">
      <button class="back-btn" @click="back" v-if="canGoBack">←</button>
      <h1>{{ pageTitle }}</h1>
      <div class="header-spacer"></div>
    </header>
    
    <main class="content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" :key="$route.fullPath" />
        </keep-alive>
      </router-view>
    </main>
    
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item" :class="{ active: $route.name === 'dashboard' }">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Home</span>
      </router-link>
      <router-link to="/projects" class="nav-item" :class="{ active: $route.name === 'projects' }">
        <span class="nav-icon">📁</span>
        <span class="nav-label">Projects</span>
      </router-link>
      <router-link to="/issues" class="nav-item" :class="{ active: $route.name === 'issues' }">
        <span class="nav-icon">✅</span>
        <span class="nav-label">Tasks</span>
      </router-link>
      <router-link to="/" class="nav-item">
        <span class="nav-icon">📊</span>
        <span class="nav-label">Stats</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const tg = inject('tg')

const themeStyles = computed(() => ({
  '--bg-color': tg?.themeParams?.bg_color || '#1a1a2e',
  '--text-color': tg?.themeParams?.text_color || '#ffffff',
  '--hint-color': tg?.themeParams?.hint_color || '#6b7280',
  '--link-color': tg?.themeParams?.link_color || '#667eea',
  '--button-color': tg?.themeParams?.button_color || '#667eea',
  '--button-text-color': tg?.themeParams?.button_text_color || '#ffffff',
  '--secondary-bg-color': tg?.themeParams?.secondary_bg_color || '#252547'
}))

const pageTitle = computed(() => {
  const titles = {
    dashboard: 'Plane',
    projects: 'Projects',
    project: 'Project',
    kanban: 'Kanban',
    issues: 'All Issues',
    cycles: 'Cycles',
    modules: 'Modules',
    issue: 'Issue'
  }
  return titles[route.name] || 'Plane'
})

const canGoBack = computed(() => route.name !== 'dashboard')

function back() {
  router.back()
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-color);
  color: var(--text-color);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
}

.header {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--secondary-bg-color);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.header h1 {
  font-size: 18px;
  font-weight: 600;
  flex: 1;
  text-align: center;
}

.back-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255,255,255,0.1);
  color: var(--text-color);
  border-radius: 10px;
  font-size: 20px;
  cursor: pointer;
}

.header-spacer { width: 40px; }

.content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 70px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: var(--secondary-bg-color);
  border-top: 1px solid rgba(255,255,255,0.1);
  padding: 8px 0;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  text-decoration: none;
  color: var(--hint-color);
  font-size: 12px;
}

.nav-item.active { color: var(--link-color); }
.nav-icon { font-size: 24px; margin-bottom: 4px; }
.nav-label { font-size: 11px; }

/* Common styles */
.card {
  background: var(--secondary-bg-color);
  border-radius: 12px;
  padding: 16px;
  margin: 12px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: var(--button-color);
  color: var(--button-text-color);
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  opacity: 0.6;
}

.empty-state {
  text-align: center;
  padding: 40px;
  opacity: 0.6;
}
</style>