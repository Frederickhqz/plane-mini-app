import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'dashboard', component: () => import('./views/Dashboard.vue') },
  { path: '/projects', name: 'projects', component: () => import('./views/Projects.vue') },
  { path: '/project/:id', name: 'project', component: () => import('./views/Project.vue') },
  { path: '/kanban/:projectId', name: 'kanban', component: () => import('./views/Kanban.vue') },
  { path: '/issues/:projectId?', name: 'issues', component: () => import('./views/Issues.vue') },
  { path: '/cycles/:projectId', name: 'cycles', component: () => import('./views/Cycles.vue') },
  { path: '/modules/:projectId', name: 'modules', component: () => import('./views/Modules.vue') },
  { path: '/issue/:projectId/:issueId', name: 'issue', component: () => import('./views/IssueDetail.vue') }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})