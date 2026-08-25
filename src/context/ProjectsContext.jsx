import { createContext, useState, useCallback } from 'react'

export const ProjectsContext = createContext(null)

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('fw_projects')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Only restore user-created projects (id > 100); never restore seeded mock data
        return Array.isArray(parsed) ? parsed.filter((p) => p && p.id > 100) : []
      } catch {
        return []
      }
    }
    return []
  })

  const persist = (updated) => {
    const userCreated = updated.filter((p) => p.id > 100)
    if (userCreated.length > 0) {
      localStorage.setItem('fw_projects', JSON.stringify(userCreated))
    } else {
      localStorage.removeItem('fw_projects')
    }
  }


  const addProject = useCallback((project) => {
    setProjects((prev) => {
      const nextId = Math.max(...prev.map((p) => p.id), 100) + 1
      const newProject = { ...project, id: nextId, date: new Date().toISOString().split('T')[0], applicants: [], popular: false }
      const updated = [newProject, ...prev]
      persist(updated)
      return updated
    })
  }, [])

  const updateApplicantStatus = useCallback((projectId, applicantId, status) => {
    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            applicants: p.applicants.map((a) =>
              a.id === applicantId ? { ...a, status } : a
            ),
          }
        }
        return p
      })
      persist(updated)
      return updated
    })
  }, [])

  const applyToProject = useCallback((projectId, applicant) => {
    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id === projectId) {
          return { ...p, applicants: [...p.applicants, applicant] }
        }
        return p
      })
      persist(updated)
      return updated
    })
  }, [])

  return (
    <ProjectsContext.Provider value={{ projects, addProject, updateApplicantStatus, applyToProject }}>
      {children}
    </ProjectsContext.Provider>
  )
}


