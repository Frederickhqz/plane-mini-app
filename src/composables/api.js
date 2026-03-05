const API_BASE = '/api'

async function apiFetch(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function apiFetchWithAuth(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
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
    return apiFetchWithAuth(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
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
    return apiFetchWithAuth(`/issues/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  
  async updateIssue(projectId, issueId, data) {
    return apiFetchWithAuth(`/issues/${projectId}/${issueId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
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
    return apiFetchWithAuth(`/cycles/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
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
    return apiFetchWithAuth(`/modules/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
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
