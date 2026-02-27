const API_BASE = '/api'

async function apiFetch(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const api = {
  // Projects
  async getProjects() {
    const data = await apiFetch('/projects')
    return data.results || []
  },
  
  async getProject(id) {
    return apiFetch(`/projects/${id}`)
  },
  
  async updateProject(id, data) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  // Issues
  async getIssues(projectId) {
    const data = await apiFetch(`/issues/${projectId}`)
    return data.results || []
  },
  
  async getIssue(projectId, issueId) {
    return apiFetch(`/issue/${projectId}/${issueId}`)
  },
  
  async createIssue(projectId, data) {
    const res = await fetch(`${API_BASE}/issues/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },
  
  async updateIssue(projectId, issueId, data) {
    const res = await fetch(`${API_BASE}/issues/${projectId}/${issueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  // States
  async getStates(projectId) {
    const data = await apiFetch(`/states/${projectId}`)
    return data.results || []
  },

  // Cycles
  async getCycles(projectId) {
    const data = await apiFetch(`/cycles/${projectId}`)
    return data.results || []
  },
  
  async getCycleIssues(projectId, cycleId) {
    const data = await apiFetch(`/cycles/${projectId}/${cycleId}/issues`)
    return data.results || []
  },
  
  async createCycle(projectId, data) {
    const res = await fetch(`${API_BASE}/cycles/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  // Modules
  async getModules(projectId) {
    const data = await apiFetch(`/modules/${projectId}`)
    return data.results || []
  },
  
  async getModuleIssues(projectId, moduleId) {
    const data = await apiFetch(`/modules/${projectId}/${moduleId}/issues`)
    return data.results || []
  },
  
  async createModule(projectId, data) {
    const res = await fetch(`${API_BASE}/modules/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  // Labels
  async getLabels(projectId) {
    const data = await apiFetch(`/labels/${projectId}`)
    return data.results || []
  }
}

export const stateGroups = {
  backlog: { label: 'Backlog', color: '#60646C', order: 1 },
  unstarted: { label: 'Todo', color: '#60646C', order: 2 },
  started: { label: 'In Progress', color: '#F59E0B', order: 3 },
  completed: { label: 'Done', color: '#46A758', order: 4 },
  cancelled: { label: 'Cancelled', color: '#9AA4BC', order: 5 }
}

export const priorities = {
  urgent: { label: 'Urgent', color: '#ef4444' },
  high: { label: 'High', color: '#f97316' },
  medium: { label: 'Medium', color: '#eab308' },
  low: { label: 'Low', color: '#3b82f6' },
  none: { label: 'No Priority', color: '#6b7280' }
}
