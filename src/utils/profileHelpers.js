import {
  MAX_AVATAR_SIZE,
  MAX_RESUME_SIZE,
} from '../data/profileSkills'

/**
 * Validates an avatar image file against live Supabase Storage constraints:
 * - JPG, PNG, or WebP only (SVG, GIF, BMP rejected)
 * - Maximum 5 MB
 * - Non-zero byte file
 */
export function validateAvatarFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' }
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty. Choose a valid image file.' }
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return { valid: false, error: 'Image file size must be less than 5 MB.' }
  }

  const validMimes = ['image/jpeg', 'image/png', 'image/webp']
  const validExts = ['.jpg', '.jpeg', '.png', '.webp']

  const fileName = file.name || ''
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase()

  const mimeValid = validMimes.includes(file.type)
  const extValid = validExts.includes(ext)

  if (!mimeValid && !extValid) {
    return { valid: false, error: 'Choose a JPG, PNG, or WebP image up to 5 MB.' }
  }

  // Determine standard file extension
  let normalizedExt = 'jpg'
  if (ext === '.png' || file.type === 'image/png') normalizedExt = 'png'
  else if (ext === '.webp' || file.type === 'image/webp') normalizedExt = 'webp'
  else normalizedExt = 'jpg'

  return { valid: true, ext: normalizedExt }
}

/**
 * Validates a resume file against live Supabase Storage constraints:
 * - PDF only
 * - Maximum 10 MB
 * - Non-zero byte file
 */
export function validateResumeFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' }
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty. Choose a valid PDF file.' }
  }

  if (file.size > MAX_RESUME_SIZE) {
    return { valid: false, error: 'Resume file size must be less than 10 MB.' }
  }

  const fileName = (file.name || '').toLowerCase()
  const isPdfExt = fileName.endsWith('.pdf')
  const isPdfMime = file.type === 'application/pdf'

  if (!isPdfExt && !isPdfMime) {
    return { valid: false, error: 'Choose a PDF resume up to 10 MB.' }
  }

  return { valid: true }
}

/**
 * Parses an old avatar public URL to extract the owned storage path.
 * Strict safety rules:
 * - Must contain exact Supabase marker: /storage/v1/object/public/avatars/
 * - Extracted path must begin with `${userId}/`
 * - Skips static defaults, external URLs, other users' folders, or malformed strings
 */
export function parseOwnedAvatarPath(url, userId) {
  if (!url || typeof url !== 'string' || !userId) return null
  const marker = '/storage/v1/object/public/avatars/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null

  let path = url.slice(idx + marker.length)
  const queryIdx = path.indexOf('?')
  if (queryIdx !== -1) {
    path = path.slice(0, queryIdx)
  }

  try {
    path = decodeURIComponent(path)
  } catch {
    // Keep fallback
  }

  if (!path || !path.startsWith(`${userId}/`)) {
    return null
  }

  return path
}

/**
 * Parses an old resume path to safely extract the owned storage object path.
 * Strict safety rules:
 * - Strips any query parameters or bucket prefix
 * - Cleaned path must begin with `${userId}/`
 */
export function parseOwnedResumePath(rawPath, userId) {
  if (!rawPath || typeof rawPath !== 'string' || !userId) return null
  let cleanPath = rawPath
  if (cleanPath.includes('/resumes/')) {
    cleanPath = cleanPath.split('/resumes/')[1]
  }

  const queryIdx = cleanPath.indexOf('?')
  if (queryIdx !== -1) {
    cleanPath = cleanPath.slice(0, queryIdx)
  }

  try {
    cleanPath = decodeURIComponent(cleanPath)
  } catch {
    // Keep fallback
  }

  if (!cleanPath || !cleanPath.startsWith(`${userId}/`)) {
    return null
  }

  return cleanPath
}
