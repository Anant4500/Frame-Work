// Mock data for the My Projects dashboard
// Joined projects — projects where the creator is a team member (not the owner)
export const joinedProjects = [
  {
    id: 'j1',
    projectId: 2,
    title: 'Neon Divide',
    poster: '/images/project-2.png',
    role: 'Sound Designer',
    creatorName: 'Kavya Iyer',
    status: 'In Production',
    location: 'Pune',
  },
  {
    id: 'j2',
    projectId: 5,
    title: 'The Last Witness',
    poster: '/images/project-5.png',
    role: 'Editor',
    creatorName: 'Isha Nair',
    status: 'Completed',
    location: 'Pune',
  },
  {
    id: 'j3',
    projectId: 6,
    title: 'Before Dusk',
    poster: '/images/project-6.png',
    role: 'Composer',
    creatorName: 'Kavya Iyer',
    status: 'Team Forming',
    location: 'Delhi',
  },
  {
    id: 'j4',
    projectId: 3,
    title: 'Midnight Rain',
    poster: '/images/project-3.png',
    role: 'Cinematographer',
    creatorName: 'Rohan Kapoor',
    status: 'Open for Collaboration',
    location: 'Delhi',
  },
]

// Applications — applications submitted by the current creator to other projects
export const myApplications = [
  {
    id: 'app1',
    projectId: 7,
    title: 'Velocity',
    poster: '/images/project-7.png',
    roleApplied: 'DOP',
    dateApplied: '2026-04-05',
    status: 'Pending',
  },
  {
    id: 'app2',
    projectId: 8,
    title: 'Sacred Ground',
    poster: '/images/project-8.png',
    roleApplied: 'Director',
    dateApplied: '2026-03-20',
    status: 'Accepted',
  },
  {
    id: 'app3',
    projectId: 9,
    title: 'Hollow Halls',
    poster: '/images/project-9.png',
    roleApplied: 'VFX Artist',
    dateApplied: '2026-04-04',
    status: 'Pending',
  },
  {
    id: 'app4',
    projectId: 3,
    title: 'Midnight Rain',
    poster: '/images/project-3.png',
    roleApplied: 'Actor',
    dateApplied: '2026-03-15',
    status: 'Rejected',
  },
]

// Compute dashboard stats
export function getDashboardStats(createdProjects, joinedList, applicationsList) {
  const activeCollaborations =
    createdProjects.filter((p) => p.status === 'Open' || p.status === 'In Production').length +
    joinedList.filter((p) => p.status === 'In Production' || p.status === 'Team Forming' || p.status === 'Open for Collaboration').length

  const completedCredits =
    createdProjects.filter((p) => p.status === 'Completed').length +
    joinedList.filter((p) => p.status === 'Completed').length

  return {
    projectsCreated: createdProjects.length,
    projectsJoined: joinedList.length,
    activeCollaborations,
    completedCredits,
  }
}
