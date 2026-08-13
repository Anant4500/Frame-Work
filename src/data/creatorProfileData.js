export const creatorData = {
  name: 'Anant Patil',
  primaryRole: 'Director',
  secondaryRoles: ['Writer', 'Screenwriter'],
  allRoles: ['Director', 'Writer', 'Screenwriter'],
  location: 'Pune, Maharashtra',
  experienceLevel: 'Indie Filmmaker',
  avatar: '/images/creator/avatar.png',
  bio: 'Independent filmmaker focused on character-driven stories, intimate narratives and experimental visual storytelling.',
  bioSecondary: 'Currently looking for collaborators for short films and independent productions.',
  stats: { projectsCreated: 8, filmsCompleted: 4, activeProjects: 2, teamMembers: 17 },
  skills: ['Direction', 'Screenwriting', 'Story Development', 'Production', 'Visual Storytelling', 'Casting'],
  featuredWork: [
    { id: 1, title: 'The Last Frame', genre: 'Thriller', language: 'Hindi', year: '2026', runtime: '15 min', logline: 'A young man confronts a memory he has spent years trying to forget.', status: 'Completed', thumbnail: '/images/creator/the-last-frame.png' },
    { id: 2, title: 'Echoes', genre: 'Drama', language: 'Hindi', year: '2025', runtime: '12 min', logline: 'Two strangers on a rooftop discover they share the same unspoken grief.', status: 'Completed', thumbnail: '/images/creator/echoes.png' },
  ],
  activeProjects: [
    { id: 10, title: 'Still Waters', genre: 'Drama', location: 'Pune', status: 'Team Formation', rolesNeeded: ['Editor', 'Sound Designer'], applications: 5, thumbnail: '/images/creator/echoes.png' },
    { id: 11, title: 'Nightfall', genre: 'Thriller', location: 'Mumbai', status: 'Pre-Production', rolesNeeded: ['DOP', 'Composer'], applications: 3, thumbnail: '/images/creator/the-last-frame.png' },
  ],
  projectsCreated: [
    { id: 1, title: 'The Last Frame', genre: 'Thriller', language: 'Hindi', location: 'Pune', role: 'Director / Writer', status: 'Completed', year: '2026', thumbnail: '/images/creator/the-last-frame.png' },
    { id: 2, title: 'Echoes', genre: 'Drama', language: 'Hindi', location: 'Mumbai', role: 'Writer', status: 'Completed', year: '2025', thumbnail: '/images/creator/echoes.png' },
    { id: 3, title: 'Fragments', genre: 'Experimental', language: 'Hindi', location: 'Pune', role: 'Assistant Director', status: 'Completed', year: '2024', thumbnail: '/images/creator/fragments.png' },
    { id: 10, title: 'Still Waters', genre: 'Drama', language: 'Hindi', location: 'Pune', role: 'Director', status: 'Active', year: '2026', thumbnail: '/images/creator/echoes.png' },
    { id: 11, title: 'Nightfall', genre: 'Thriller', language: 'Hindi', location: 'Mumbai', role: 'Director / Writer', status: 'Active', year: '2026', thumbnail: '/images/creator/the-last-frame.png' },
  ],
  teams: [
    { project: 'The Last Frame', members: [
      { name: 'Anant Patil', role: 'Director', avatar: '/images/creator/avatar.png' },
      { name: 'Rohan Patil', role: 'Cinematographer', avatar: null },
      { name: 'Aryan Kulkarni', role: 'Editor', avatar: '/images/profile/avatar.png' },
      { name: 'Priya Shah', role: 'Sound Designer', avatar: null },
    ]},
    { project: 'Still Waters', members: [
      { name: 'Anant Patil', role: 'Director', avatar: '/images/creator/avatar.png' },
      { name: 'Meera Joshi', role: 'Writer', avatar: null },
    ]},
  ],
  filmography: [
    { year: '2026', project: 'The Last Frame', role: 'Director • Writer', status: 'Completed' },
    { year: '2025', project: 'Echoes', role: 'Writer', status: 'Completed' },
    { year: '2024', project: 'Fragments', role: 'Assistant Director', status: 'Completed' },
  ],
  completedFilms: [
    { id: 1, title: 'The Last Frame', genre: 'Thriller', runtime: '15 min', language: 'Hindi', year: '2026', role: 'Director / Writer', hasVideo: true, thumbnail: '/images/creator/the-last-frame.png' },
    { id: 2, title: 'Echoes', genre: 'Drama', runtime: '12 min', language: 'Hindi', year: '2025', role: 'Writer', hasVideo: true, thumbnail: '/images/creator/echoes.png' },
    { id: 3, title: 'Fragments', genre: 'Experimental', runtime: '8 min', language: 'Hindi', year: '2024', role: 'Assistant Director', hasVideo: false, thumbnail: '/images/creator/fragments.png' },
  ],
  lookingFor: {
    roles: ['Editor', 'Sound Designer', 'Production Designer'],
    location: 'Pune / Mumbai',
    projectType: 'Short Films',
    budget: 'Passion / Indie',
    timeline: 'September–November 2026',
  },
  credits: [
    { project: 'The Last Frame', role: 'Director', year: '2026' },
    { project: 'Echoes', role: 'Writer', year: '2025' },
    { project: 'Fragments', role: 'Assistant Director', year: '2024' },
    { project: 'Between Lines', role: 'Writer', year: '2024' },
  ],
}
