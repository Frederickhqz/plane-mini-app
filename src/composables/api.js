const API_BASE = '/api'
const PLANE_API = 'http://168.231.69.92:54617/api/v1'
const API_KEY = 'plane_api_a671d43b3a7248108f522e8c6703aa85'
const WORKSPACE = 'agents'

async function planeFetch(endpoint) {
  const res = await fetch(`${PLANE_API}${endpoint}`, {
    headers: { 'X-API-Key': API_KEY }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const api = {
  // Projects
  async getProjects() {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/`)
    return data.results || []
  },
  
  async getProject(id) {
    return planeFetch(`/workspaces/${WORKSPACE}/projects/${id}/`)
  },
  
  async updateProject(id, data) {
    const res = await fetch(`${PLANE_API}/workspaces/${WORKSPACE}/projects/${id}/`, {
      method: 'PATCH',
      headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  // Issues
  async getIssues(projectId) {
    const [issues, states] = await Promise.all([
      planeFetch(`/workspaces/${WORKSPACE}/projects/${projectId}/issues/`),
      planeFetch(`/workspaces/${WORKSPACE}/projects/${projectId}/states/`)
    ])
    
    const stateMap = {}
    states.results?.forEach(s => { stateMap[s.id] = s })
    
    return (issues.results || []).map(issue => ({
      ...issue,
      state_name: stateMap[issue.state]?.name || 'Unknown',
      state_group: stateMap[issue.state]?.group || 'unknown',
      state_color: stateMap[issue.state]?.color || '#60646C'
    }))
  },
  
  async getIssue(projectId, issueId) {
    return planeFetch(`/workspaces/${WORKSPACE}/projects/${projectId}/issues/${issueId}/`)
  },
  
  async createIssue(projectId, data) {
    const res = await fetch(`${PLANE_API}/workspaces/${WORKSPACE}/projects/${projectId}/issues/`, {
      method: 'POST',
      headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },
  
  async updateIssue(projectId, issueId, data) {
    const res = await fetch(`${PLANE_API}/workspaces/${WORKSPACE}/projects/${projectId}/issues/${issueId}/`, {
      method: 'PATCH',
      headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  // States
  async getStates(projectId) {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${projectId}/states/`)
    return data.results || []
  },

  // Cycles
  async getCycles(projectId) {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${projectId}/cycles/`)
    return data.results || []
  },
  
  async getCycleIssues(projectId, cycleId) {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${projectId}/cycles/${cycleId}/cycle-issues/`)
    return data.results || []
  },
  
  async createCycle(projectId, data) {
    const res = await fetch(`${PLANE_API}/workspaces/${WORKSPACE}/projects/${projectId}/cycles/`, {
      method: 'POST',
      headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, project_id: projectId })
    })
    return res.json()
  },

  // Modules
  async getModules(projectId) {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${projectId}/modules/`)
    return data.results || []
  },
  
  async getModuleIssues(projectId, moduleId) {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${projectId}/modules/${moduleId}/module-issues/`)
    return data.results || []
  },
  
  async createModule(projectId, data) {
    const res = await fetch(`${PLANE_API}/workspaces/${WORKSPACE}/projects/${projectId}/modules/`, {
      method: 'POST',
      headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  // Labels
  async getLabels(projectId) {
    const data = await planeFetch(`/workspaces/${WORKSPACE}/projects/${projectId}/labels/`)
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