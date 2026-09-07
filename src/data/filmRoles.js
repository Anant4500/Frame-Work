/**
 * Official FrameWork Professional Filmmaking Role Catalog
 * 10 Filmmaking Departments, 81 Canonical Roles
 */

export const FILM_ROLE_CATEGORIES = [
  {
    category: 'Development & Pre-Production',
    roles: [
      {
        name: 'Executive Producer',
        aliases: ['EP', 'Producer', 'Financier', 'Executive'],
      },
      {
        name: 'Co-Producer',
        aliases: ['Producer', 'Associate Producer'],
      },
      {
        name: 'Line Producer',
        aliases: ['LP', 'Producer', 'Physical Production'],
      },
      {
        name: 'Unit Production Manager (UPM)',
        aliases: ['UPM', 'Production Manager', 'PM', 'Logistics'],
      },
      {
        name: 'Casting Director',
        aliases: ['Casting', 'Actors Casting', 'Talent Scout'],
      },
      {
        name: 'Location Manager',
        aliases: ['Locations', 'Location Scouting', 'Site Manager'],
      },
      {
        name: 'Location Scout',
        aliases: ['Scout', 'Locations', 'Site Scout'],
      },
      {
        name: 'Storyboard Artist',
        aliases: ['Storyboard', 'Storyboards', 'Illustrator', 'Sketch Artist'],
      },
      {
        name: 'Concept Artist',
        aliases: ['Concept Art', 'Visual Development', 'VisDev', 'Illustrator'],
      },
      {
        name: 'Writer',
        aliases: ['Screenwriter', 'Scriptwriter', 'Script', 'Author'],
      },
      {
        name: 'Director',
        aliases: ['Directing', 'Filmmaker', 'Helmer'],
      },
    ],
  },
  {
    category: 'Production — Direction & Management',
    roles: [
      {
        name: 'First Assistant Director (1st AD)',
        aliases: ['1st AD', 'First AD', 'Assistant Director', 'AD', 'Schedule', 'Call Sheet'],
      },
      {
        name: 'Second Assistant Director (2nd AD)',
        aliases: ['2nd AD', 'Second AD', 'Assistant Director', 'AD', 'Background Coordinator'],
      },
      {
        name: 'Second Second Assistant Director (2nd 2nd AD)',
        aliases: ['2nd 2nd AD', 'Second Second AD', '3rd AD', 'Third AD', 'AD'],
      },
      {
        name: 'Script Supervisor',
        aliases: ['Continuity', 'Script Supervisor', 'Scripty'],
      },
      {
        name: 'Production Coordinator',
        aliases: ['POC', 'Production Office', 'Coordinator'],
      },
      {
        name: 'Key Production Assistant (Key PA)',
        aliases: ['Key PA', 'Lead PA', 'Head PA', 'Production Assistant'],
      },
      {
        name: 'Production Assistant (PA)',
        aliases: ['PA', 'Production Assistant', 'Runner', 'Set PA'],
      },
    ],
  },
  {
    category: 'Production — Camera',
    roles: [
      {
        name: 'Director of Photography (DP) / Cinematographer',
        aliases: ['DP', 'DoP', 'Cinematographer', 'Cinematography', 'Camera', 'Lighting Cameraman'],
      },
      {
        name: 'Camera Operator',
        aliases: ['Cam Op', 'Camera Op', 'Camera', 'Operator', 'B Camera', 'A Camera'],
      },
      {
        name: 'First Assistant Camera (1st AC / Focus Puller)',
        aliases: ['1st AC', 'First AC', 'Focus Puller', 'Camera Assistant', 'Focus', 'Camera'],
      },
      {
        name: 'Second Assistant Camera (2nd AC / Clapper Loader)',
        aliases: ['2nd AC', 'Second AC', 'Clapper Loader', 'Loader', 'Slate', 'Clapper', 'Camera'],
      },
      {
        name: 'Digital Imaging Technician (DIT)',
        aliases: ['DIT', 'Data Wrangler', 'Digital Imaging', 'Color on Set', 'Media Manager', 'Camera'],
      },
      {
        name: 'Steadicam Operator',
        aliases: ['Steadicam', 'Trinity Operator', 'Gimbal Operator', 'Camera'],
      },
    ],
  },
  {
    category: 'Production — Grip & Electric (Lighting)',
    roles: [
      {
        name: 'Gaffer',
        aliases: ['Chief Lighting Technician', 'CLT', 'Head Electrician', 'Lighting', 'Electric'],
      },
      {
        name: 'Best Boy Electric',
        aliases: ['BBE', 'Assistant Gaffer', 'Electric', 'Lighting'],
      },
      {
        name: 'Lighting Technician',
        aliases: ['Electrician', 'Juicer', 'Sparks', 'Lamp Operator', 'Lighting', 'Electric'],
      },
      {
        name: 'Key Grip',
        aliases: ['Head Grip', 'Grip', 'Rigging', 'Camera Support'],
      },
      {
        name: 'Best Boy Grip',
        aliases: ['BBG', 'Assistant Key Grip', 'Grip'],
      },
      {
        name: 'Dolly Grip',
        aliases: ['Dolly', 'Track', 'Slider', 'Grip'],
      },
      {
        name: 'Rigging Gaffer',
        aliases: ['Rigging Electric', 'Advance Lighting', 'Lighting', 'Electric'],
      },
      {
        name: 'Rigging Grip',
        aliases: ['Rigging', 'Scaffolding', 'Truss', 'Grip'],
      },
    ],
  },
  {
    category: 'Production — Sound',
    roles: [
      {
        name: 'Production Sound Mixer',
        aliases: ['Sound Mixer', 'Sound Recordist', 'Location Sound', 'Audio', 'Sound'],
      },
      {
        name: 'Boom Operator',
        aliases: ['Boom Op', 'Boom Mic', 'Mic Operator', 'Audio', 'Sound'],
      },
      {
        name: 'Sound Utility / Cable Person',
        aliases: ['Sound Utility', 'Cable Person', 'Cable Puller', 'Sound Assistant', 'Audio', 'Sound'],
      },
    ],
  },
  {
    category: 'Production — Art Department',
    roles: [
      {
        name: 'Production Designer',
        aliases: ['PD', 'Head of Art', 'Art Department', 'Scenic Design', 'World Building'],
      },
      {
        name: 'Art Director',
        aliases: ['Art Direction', 'Art Department', 'Supervising Art Director'],
      },
      {
        name: 'Set Decorator',
        aliases: ['Set Dec', 'Decorator', 'Set Dressing', 'Furnishings', 'Art Department'],
      },
      {
        name: 'Property Master',
        aliases: ['Prop Master', 'Props', 'Weapons Master', 'Hand Props', 'Art Department'],
      },
      {
        name: 'Leadman',
        aliases: ['Lead Person', 'Set Dressing Lead', 'Art Department'],
      },
      {
        name: 'Set Dresser',
        aliases: ['Dresser', 'Swing Gang', 'Set Dressing', 'Art Department'],
      },
      {
        name: 'Scenic Artist',
        aliases: ['Scenic Painter', 'Backdrop Painter', 'Faux Finish', 'Painter', 'Art Department'],
      },
      {
        name: 'Construction Coordinator',
        aliases: ['Head Carpenter', 'Set Construction', 'Builder', 'Art Department'],
      },
    ],
  },
  {
    category: 'Production — Wardrobe, Hair & Makeup',
    roles: [
      {
        name: 'Costume Designer',
        aliases: ['Wardrobe Designer', 'Stylist', 'Costumes', 'Wardrobe'],
      },
      {
        name: 'Wardrobe Supervisor',
        aliases: ['Costume Supervisor', 'Wardrobe', 'Costumes'],
      },
      {
        name: 'Set Costumer',
        aliases: ['Costumer', 'Wardrobe Assistant', 'Costumes', 'Wardrobe'],
      },
      {
        name: 'Key Makeup Artist',
        aliases: ['Key Makeup', 'MUA', 'Makeup Lead', 'HMU', 'Cosmetics'],
      },
      {
        name: 'Key Hair Stylist',
        aliases: ['Key Hair', 'Hairstylist', 'Hair Lead', 'HMU', 'Hair'],
      },
      {
        name: 'Special Effects Makeup Artist',
        aliases: ['SFX Makeup', 'Prosthetics', 'FX Makeup', 'Creature Makeup', 'Gore', 'MUA', 'Makeup'],
      },
    ],
  },
  {
    category: 'Production — Specialized & Support',
    roles: [
      {
        name: 'Stunt Coordinator',
        aliases: ['Stunts', 'Action Director', 'Fight Choreographer', 'Stunt Safety'],
      },
      {
        name: 'Special Effects (SFX) Supervisor',
        aliases: ['SFX Supervisor', 'Practical Effects', 'Pyrotechnics', 'Atmospherics', 'SFX'],
      },
      {
        name: 'Transportation Coordinator',
        aliases: ['Transpo', 'Transportation Captain', 'Driver Coordinator', 'Fleet'],
      },
      {
        name: 'Picture Car Coordinator',
        aliases: ['Picture Cars', 'Vehicles', 'Automotive'],
      },
      {
        name: 'Craft Services',
        aliases: ['Crafty', 'Snacks', 'On-Set Refreshments'],
      },
      {
        name: 'Catering',
        aliases: ['Caterer', 'Food Service', 'Meals'],
      },
      {
        name: 'Unit Publicist',
        aliases: ['Publicity', 'EPK', 'Press', 'PR', 'Media Relations'],
      },
      {
        name: 'Medic',
        aliases: ['Set Medic', 'First Aid', 'Paramedic', 'Safety Officer'],
      },
    ],
  },
  {
    category: 'Post-Production',
    roles: [
      {
        name: 'Post-Production Supervisor',
        aliases: ['Post Supervisor', 'Post Coordinator', 'Post Producer', 'Post'],
      },
      {
        name: 'Editor',
        aliases: ['Film Editor', 'Video Editor', 'Lead Editor', 'Offline Editor', 'Cutter'],
      },
      {
        name: 'First Assistant Editor',
        aliases: ['1st AE', 'Assistant Editor', 'AE', 'Sync and Group', 'Post'],
      },
      {
        name: 'Second Assistant Editor',
        aliases: ['2nd AE', 'Assistant Editor', 'AE', 'Post'],
      },
      {
        name: 'Sound Designer',
        aliases: ['Sound Design', 'Audio Design', 'SFX Audio', 'Sound Effects', 'Sound'],
      },
      {
        name: 'Re-recording Mixer',
        aliases: ['Dubbing Mixer', 'Final Mix', 'Sound Mixer', 'Audio Post', 'Sound'],
      },
      {
        name: 'Dialogue Editor',
        aliases: ['Dialogue', 'DX Editor', 'Voice Editor', 'Audio Post', 'Sound'],
      },
      {
        name: 'Foley Artist',
        aliases: ['Foley Walker', 'Foley Mixer', 'Foley', 'Sound Effects', 'Sound'],
      },
      {
        name: 'ADR Mixer',
        aliases: ['ADR Recordist', 'Dubbing', 'Automated Dialogue Replacement', 'Voiceover', 'Sound'],
      },
      {
        name: 'Visual Effects (VFX) Supervisor',
        aliases: ['VFX Supervisor', 'Visual Effects Lead', 'VFX', 'CGI', 'Digital Effects'],
      },
      {
        name: 'VFX Producer',
        aliases: ['Visual Effects Producer', 'VFX Production', 'VFX Coordinator', 'VFX'],
      },
      {
        name: 'Compositor / VFX Artist',
        aliases: ['Compositor', 'Comp Artist', 'VFX Artist', 'Rotoscoping', 'Clean-up', 'CGI', 'VFX'],
      },
      {
        name: 'Colorist',
        aliases: ['Colourist', 'Color Grader', 'DI Colorist', 'Digital Intermediate', 'Color Timing'],
      },
      {
        name: 'Composer',
        aliases: ['Film Composer', 'Score', 'Original Music', 'Soundtrack', 'Music'],
      },
      {
        name: 'Music Supervisor',
        aliases: ['Music Licensing', 'Song Clearance', 'Music Rights', 'Music'],
      },
      {
        name: 'Title Designer',
        aliases: ['Main Titles', 'Motion Graphics', 'Typography', 'Credits Designer'],
      },
    ],
  },
  {
    category: 'Cast & Performance',
    roles: [
      {
        name: 'Actor',
        aliases: ['Screen Actor', 'Cast Member', 'Talent'],
      },
      {
        name: 'Lead Actor',
        aliases: ['Lead', 'Protagonist', 'Principal Actor', 'Star'],
      },
      {
        name: 'Supporting Actor',
        aliases: ['Supporting', 'Featured Actor', 'Day Player'],
      },
      {
        name: 'Background Actor / Extra',
        aliases: ['Extra', 'Background Performer', 'Background Talent', 'Atmosphere'],
      },
      {
        name: 'Voice Actor',
        aliases: ['Voiceover Artist', 'Voice-over Artist', 'Voice Talent', 'VO', 'Voiceover', 'Voice-Over'],
      },
      {
        name: 'Child Actor',
        aliases: ['Young Actor', 'Youth Actor', 'Minor Actor', 'Kid Actor'],
      },
      {
        name: 'Stunt Performer',
        aliases: ['Stunt Double', 'Stunt Person', 'Stunt Actor', 'Stuntman', 'Stuntwoman'],
      },
      {
        name: 'Dancer / Performer',
        aliases: ['Dancer', 'Choreographed Performer'],
      },
    ],
  },
]

/**
 * Filter roles by search query across role names, aliases, and department categories.
 * Preserves category grouping and original department/role sorting.
 */
export function filterRolesCatalog(categories, query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return categories

  return categories
    .map((dept) => {
      const categoryMatches = dept.category.toLowerCase().includes(q)

      const matchingRoles = dept.roles.filter((role) => {
        if (categoryMatches) return true
        if (role.name.toLowerCase().includes(q)) return true
        if (role.aliases && role.aliases.some((alias) => alias.toLowerCase().includes(q) || q.includes(alias.toLowerCase()))) {
          return true
        }
        return false
      })

      return {
        ...dept,
        roles: matchingRoles,
      }
    })
    .filter((dept) => dept.roles.length > 0)
}

// Build lookup maps once at module initialization for O(1) resolution
const CANONICAL_ROLE_TO_CATEGORY = new Map()
const CANONICAL_NAME_TO_ROLE = new Map()
const CANONICAL_ROLE_ALIASES = new Map()
const ALIAS_CATEGORY_SETS = new Map()
const ALIAS_TO_CANONICAL_ROLES = new Map()

for (const dept of FILM_ROLE_CATEGORIES) {
  for (const roleObj of dept.roles) {
    if (roleObj?.name) {
      const canonKey = roleObj.name.trim().toLowerCase()
      CANONICAL_ROLE_TO_CATEGORY.set(canonKey, dept.category)
      CANONICAL_NAME_TO_ROLE.set(canonKey, roleObj.name)
      CANONICAL_ROLE_ALIASES.set(canonKey, Array.isArray(roleObj.aliases) ? roleObj.aliases : [])
    }
    if (Array.isArray(roleObj.aliases)) {
      for (const alias of roleObj.aliases) {
        if (!alias || typeof alias !== 'string') continue
        const aliasKey = alias.trim().toLowerCase()
        if (!ALIAS_CATEGORY_SETS.has(aliasKey)) {
          ALIAS_CATEGORY_SETS.set(aliasKey, new Set())
        }
        ALIAS_CATEGORY_SETS.get(aliasKey).add(dept.category)

        if (!ALIAS_TO_CANONICAL_ROLES.has(aliasKey)) {
          ALIAS_TO_CANONICAL_ROLES.set(aliasKey, new Set())
        }
        if (roleObj?.name) {
          ALIAS_TO_CANONICAL_ROLES.get(aliasKey).add(roleObj.name)
        }
      }
    }
  }
}

// Build unambiguous alias maps (only aliases that resolve to exactly 1 category / role)
const UNIQUE_ALIAS_TO_CATEGORY = new Map()
for (const [aliasKey, categorySet] of ALIAS_CATEGORY_SETS.entries()) {
  if (categorySet.size === 1) {
    const singleCategory = Array.from(categorySet)[0]
    if (!CANONICAL_ROLE_TO_CATEGORY.has(aliasKey) || CANONICAL_ROLE_TO_CATEGORY.get(aliasKey) === singleCategory) {
      UNIQUE_ALIAS_TO_CATEGORY.set(aliasKey, singleCategory)
    }
  }
}

const UNIQUE_ALIAS_TO_CANONICAL = new Map()
for (const [aliasKey, roleSet] of ALIAS_TO_CANONICAL_ROLES.entries()) {
  if (roleSet.size === 1) {
    const singleRole = Array.from(roleSet)[0]
    if (!CANONICAL_NAME_TO_ROLE.has(aliasKey) || CANONICAL_NAME_TO_ROLE.get(aliasKey) === singleRole) {
      UNIQUE_ALIAS_TO_CANONICAL.set(aliasKey, singleRole)
    }
  }
}

/**
 * Resolve a role name (canonical or unique alias) to its canonical department category.
 * Returns the exact canonical category string or null if unmatched / ambiguous.
 *
 * @param {string} roleName
 * @returns {string|null}
 */
export function getRoleCategory(roleName) {
  if (!roleName || typeof roleName !== 'string') return null
  const key = roleName.trim().toLowerCase()

  // 1. Exact canonical role name match
  if (CANONICAL_ROLE_TO_CATEGORY.has(key)) {
    return CANONICAL_ROLE_TO_CATEGORY.get(key)
  }

  // 2. Unambiguous alias match
  if (UNIQUE_ALIAS_TO_CATEGORY.has(key)) {
    return UNIQUE_ALIAS_TO_CATEGORY.get(key)
  }

  return null
}

/**
 * Canonicalize a role name to its official canonical project role.
 * - Exact canonical match returns the official canonical name.
 * - Unique alias match returns the official canonical role.
 * - Ambiguous alias returns the original trimmed string (rule 3: do not guess).
 * - Unknown / legacy role returns the trimmed string (rule 4: preserved as legacy).
 * Returns null if input is not a non-empty string.
 *
 * @param {string} roleName
 * @returns {string|null}
 */
export function canonicalizeRole(roleName) {
  if (!roleName || typeof roleName !== 'string') return null
  const trimmed = roleName.trim()
  if (!trimmed) return null
  const key = trimmed.toLowerCase()

  // 1. Exact canonical name match (case-insensitive)
  if (CANONICAL_NAME_TO_ROLE.has(key)) {
    return CANONICAL_NAME_TO_ROLE.get(key)
  }

  // 2. Unambiguous unique alias match
  if (UNIQUE_ALIAS_TO_CANONICAL.has(key)) {
    return UNIQUE_ALIAS_TO_CANONICAL.get(key)
  }

  // 3. Ambiguous alias or unknown/legacy role -> preserve original trimmed string
  return trimmed
}

/**
 * Retrieve aliases for a canonical role name.
 *
 * @param {string} roleName
 * @returns {string[]}
 */
export function getRoleAliases(roleName) {
  if (!roleName || typeof roleName !== 'string') return []
  return CANONICAL_ROLE_ALIASES.get(roleName.trim().toLowerCase()) || []
}

/**
 * Check if a role name is an exact canonical role.
 *
 * @param {string} roleName
 * @returns {boolean}
 */
export function isCanonicalRole(roleName) {
  if (!roleName || typeof roleName !== 'string') return false
  return CANONICAL_NAME_TO_ROLE.has(roleName.trim().toLowerCase())
}


