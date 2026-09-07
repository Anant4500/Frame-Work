/**
 * Canonical profile skills, limits, and option constants for FrameWork Profile
 * 
 * IMPORTANT: These are user profile craft proficiencies, NOT project staffing roles.
 * Do not import or mix with filmRoles.js (project staffing catalog).
 */

export const MAX_CREATOR_SKILLS = 5
export const MAX_COLLABORATOR_SKILLS = 8
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5 MB
export const MAX_RESUME_SIZE = 10 * 1024 * 1024 // 10 MB
export const MAX_BIO_LENGTH = 1500

export const EXPERIENCE_OPTIONS = [
  'Beginner',
  'Student',
  'Intermediate',
  'Professional',
]

export const AVAILABILITY_OPTIONS = [
  'Available',
  'Limited Availability',
  'Unavailable',
]

export const POPULAR_CREATOR_DISCIPLINES = [
  'Direction',
  'Screenwriting',
  'Production',
  'Cinematography',
  'Production Design',
  'Video Editing',
]

export const REMAINING_CREATOR_DISCIPLINES = [
  'Sound Design',
  'Music',
  'Color Grading',
  'VFX',
  'Animation',
  'Photography',
]

export const CREATOR_DISCIPLINES = [
  ...POPULAR_CREATOR_DISCIPLINES,
  ...REMAINING_CREATOR_DISCIPLINES,
]

export const COLLABORATOR_DEPARTMENTS = [
  'All',
  'Performance',
  'Direction',
  'Writing',
  'Production',
  'Camera',
  'Lighting',
  'Art',
  'Sound',
  'Post',
  'VFX',
  'Media',
]

export const COLLABORATOR_SKILL_GROUPS = [
  {
    department: 'Performance',
    skills: [
      'Acting',
      'Voice Acting',
      'Stunt Performance',
      'Dance & Choreography',
    ],
  },
  {
    department: 'Direction',
    skills: [
      'Assistant Direction',
      'Script Supervision',
      'Casting',
    ],
  },
  {
    department: 'Writing',
    skills: [
      'Screenwriting',
      'Story Development',
      'Dialogue Writing',
    ],
  },
  {
    department: 'Production',
    skills: [
      'Production',
      'Production Management',
      'Line Production',
      'Production Coordination',
      'Location Management',
    ],
  },
  {
    department: 'Camera',
    skills: [
      'Cinematography',
      'Camera Operation',
      'Camera Assistance',
      'Focus Pulling',
      'Drone Cinematography',
      'Photography',
    ],
  },
  {
    department: 'Lighting',
    skills: [
      'Lighting',
      'Gaffer',
      'Grip',
      'Key Grip',
    ],
  },
  {
    department: 'Art',
    skills: [
      'Production Design',
      'Art Direction',
      'Set Design',
      'Set Decoration',
      'Props',
      'Costume Design',
      'Makeup',
      'Hair Styling',
    ],
  },
  {
    department: 'Sound',
    skills: [
      'Sound Recording',
      'Sound Design',
      'Boom Operation',
      'Audio Editing',
      'Foley',
      'Music',
    ],
  },
  {
    department: 'Post',
    skills: [
      'Video Editing',
      'Color Grading',
      'Motion Graphics',
      'Subtitling',
    ],
  },
  {
    department: 'VFX',
    skills: [
      'VFX',
      'Compositing',
      '3D',
      'Animation',
    ],
  },
  {
    department: 'Media',
    skills: [
      'BTS Photography',
      'Behind-the-Scenes Video',
      'Social Media Content',
      'Poster & Graphic Design',
    ],
  },
]

export const ALL_COLLABORATOR_SKILLS = COLLABORATOR_SKILL_GROUPS.flatMap((g) => g.skills)
