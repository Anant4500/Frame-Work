import { createContext, useState, useCallback } from 'react'

const defaultProjects = [
  {
    id: 1,
    title: 'Echoes of Amber',
    logline: 'A young woman returns to her ancestral village and uncovers secrets that challenge everything she believed about her family.',
    genre: 'Drama',
    location: 'Mumbai',
    status: 'Open',
    thumbnail: '/images/project-1.png',
    roles: ['Actor', 'Editor', 'Sound Designer'],
    date: '2026-03-28',
    popular: true,
    scriptUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    creator: { id: 'c1', name: 'Arjun Mehra', role: 'Director', avatar: null },
    applicants: [
      { id: 'a1', name: 'Priya Sharma', role: 'Actor', message: 'I have 3 years of theatre experience and would love to audition for the lead role.', status: 'pending', avatar: null },
      { id: 'a2', name: 'Rahul Desai', role: 'Editor', message: 'Experienced with DaVinci Resolve and Premiere Pro. Portfolio available on request.', status: 'pending', avatar: null },
      { id: 'a3', name: 'Neha Kulkarni', role: 'Sound Designer', message: 'Specialized in ambient sound design for independent films.', status: 'pending', avatar: null },
    ],
  },
  {
    id: 2,
    title: 'Neon Divide',
    logline: 'In a dystopian city split by light and shadow, two hackers from opposite sides must unite to prevent a digital apocalypse.',
    genre: 'Sci-Fi',
    location: 'Pune',
    status: 'In Production',
    thumbnail: '/images/project-2.png',
    roles: ['Cinematographer', 'VFX Artist'],
    date: '2026-03-25',
    popular: true,
    scriptUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    creator: { id: 'c2', name: 'Kavya Iyer', role: 'Producer', avatar: null },
    applicants: [
      { id: 'a4', name: 'Vikram Singh', role: 'VFX Artist', message: 'Worked on 5 indie sci-fi shorts. Proficient with Blender and After Effects.', status: 'accepted', avatar: null },
    ],
  },
  {
    id: 3,
    title: 'Midnight Rain',
    logline: `A detective's obsession with a cold case leads her into a web of deceit that mirrors her own dark past.`,
    genre: 'Thriller',
    location: 'Delhi',
    status: 'Open',
    thumbnail: '/images/project-3.png',
    roles: ['Actor', 'Director', 'Writer'],
    date: '2026-03-20',
    popular: false,
    scriptUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    creator: { id: 'c3', name: 'Rohan Kapoor', role: 'Writer', avatar: null },
    applicants: [],
  },
  {
    id: 4,
    title: 'Golden Hour',
    logline: 'Two estranged siblings reunite during the golden hour of their father\'s final day, confronting years of silence.',
    genre: 'Drama',
    location: 'Mumbai',
    status: 'Open',
    thumbnail: '/images/project-4.png',
    roles: ['Actor', 'Composer', 'Editor'],
    date: '2026-03-15',
    popular: true,
    scriptUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    creator: { id: 'c1', name: 'Arjun Mehra', role: 'Director', avatar: null },
    applicants: [
      { id: 'a5', name: 'Ananya Patel', role: 'Actor', message: 'Classical trained actress with experience in emotional drama pieces.', status: 'pending', avatar: null },
    ],
  },
  {
    id: 5,
    title: 'The Last Witness',
    logline: 'The sole witness to a high-profile crime must decide between truth and self-preservation in a corrupt system.',
    genre: 'Mystery',
    location: 'Pune',
    status: 'Completed',
    thumbnail: '/images/project-5.png',
    roles: ['Actor', 'DOP', 'Sound Designer'],
    date: '2026-04-01',
    popular: false,
    scriptUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    creator: { id: 'c4', name: 'Isha Nair', role: 'Director', avatar: null },
    applicants: [],
  },
  {
    id: 6,
    title: 'Before Dusk',
    logline: 'Two strangers meet on a train platform at sunset and share stories that change the course of their lives forever.',
    genre: 'Romance',
    location: 'Delhi',
    status: 'Open',
    thumbnail: '/images/project-6.png',
    roles: ['Actor', 'Editor', 'Writer'],
    date: '2026-03-30',
    popular: true,
    scriptUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    creator: { id: 'c2', name: 'Kavya Iyer', role: 'Producer', avatar: null },
    applicants: [],
  },
  {
    id: 7,
    title: 'Velocity',
    logline: 'An underground street racer discovers that the stakes are far higher than trophies when the cartel comes calling.',
    genre: 'Action',
    location: 'Mumbai',
    status: 'In Production',
    thumbnail: '/images/project-7.png',
    roles: ['Stunt Coordinator', 'DOP', 'Editor'],
    date: '2026-04-02',
    popular: true,
    scriptUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    creator: { id: 'c3', name: 'Rohan Kapoor', role: 'Writer', avatar: null },
    applicants: [
      { id: 'a6', name: 'Suresh Reddy', role: 'Stunt Coordinator', message: '10 years of experience in Tollywood action sequences.', status: 'pending', avatar: null },
      { id: 'a7', name: 'Maya Joshi', role: 'DOP', message: 'Specialized in high-speed cinematography with RED cameras.', status: 'pending', avatar: null },
    ],
  },
  {
    id: 8,
    title: 'Sacred Ground',
    logline: 'A documentary crew ventures into a remote tribal region to tell a story of resilience, tradition, and modern conflict.',
    genre: 'Documentary',
    location: 'Pune',
    status: 'Open',
    thumbnail: '/images/project-8.png',
    roles: ['Director', 'Editor', 'Sound Designer'],
    date: '2026-03-18',
    popular: false,
    scriptUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    creator: { id: 'c4', name: 'Isha Nair', role: 'Director', avatar: null },
    applicants: [],
  },
  {
    id: 9,
    title: 'Hollow Halls',
    logline: 'Students at an elite boarding school uncover a terrifying secret hidden beneath the campus that has claimed lives for decades.',
    genre: 'Horror',
    location: 'Delhi',
    status: 'Open',
    thumbnail: '/images/project-9.png',
    roles: ['Actor', 'VFX Artist', 'Composer'],
    date: '2026-04-03',
    popular: true,
    scriptUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    creator: { id: 'c1', name: 'Arjun Mehra', role: 'Director', avatar: null },
    applicants: [],
  },
]

export const ProjectsContext = createContext(null)

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('fw_projects')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Merge: keep user-created projects that aren't in defaults
        const defaultIds = defaultProjects.map((p) => p.id)
        const userCreated = parsed.filter((p) => !defaultIds.includes(p.id))
        return [...defaultProjects, ...userCreated]
      } catch {
        return defaultProjects
      }
    }
    return defaultProjects
  })

  const persist = (updated) => {
    const userCreated = updated.filter((p) => p.id > 100)
    if (userCreated.length > 0) {
      localStorage.setItem('fw_projects', JSON.stringify(updated))
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


