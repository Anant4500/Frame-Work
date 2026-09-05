import { getRoleCategory } from './filmRoles.js'

/**
 * Official FrameWork Role Category Artwork Mapping
 * Maps each of the 9 canonical filmmaking department categories to its static PNG artwork.
 */
export const ROLE_CATEGORY_IMAGES = {
  'Development & Pre-Production':
    '/images/role-categories/development-preproduction.png',

  'Production — Direction & Management':
    '/images/role-categories/direction-management.png',

  'Production — Camera':
    '/images/role-categories/camera.png',

  'Production — Grip & Electric (Lighting)':
    '/images/role-categories/grip-electric.png',

  'Production — Sound':
    '/images/role-categories/sound.png',

  'Production — Art Department':
    '/images/role-categories/art-department.png',

  'Production — Wardrobe, Hair & Makeup':
    '/images/role-categories/wardrobe-hair-makeup.png',

  'Production — Specialized & Support':
    '/images/role-categories/specialized-support.png',

  'Post-Production':
    '/images/role-categories/post-production.png',
}

/**
 * Resolve a role name to its corresponding category PNG asset path.
 *
 * @param {string} roleName - The role title (canonical name or valid unique alias)
 * @returns {string|null} - The asset path (e.g. '/images/role-categories/camera.png') or null if unmatched
 */
export function getRoleCategoryImage(roleName) {
  const category = getRoleCategory(roleName)
  if (!category) return null
  return ROLE_CATEGORY_IMAGES[category] ?? null
}
