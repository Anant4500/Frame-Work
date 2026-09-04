// Helper function for the My Projects dashboard

// Compute dashboard stats
export function getDashboardStats(createdProjects, joinedList) {
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
