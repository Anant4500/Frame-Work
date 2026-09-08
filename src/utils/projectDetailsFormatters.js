/**
 * Shared helpers and canonical options for project details fields.
 */

export const formatOptions = [
  'Short Film',
  'Feature Film',
  'Documentary',
  'Web Series',
  'Music Video',
  'Other',
]

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/**
 * Format a YYYY-MM-DD date string without timezone day shift.
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {string|null}
 */
export function formatDateOnly(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null
  const parts = dateStr.split('-')
  if (parts.length !== 3) return null

  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const day = parseInt(parts[2], 10)

  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 0 || month > 11) {
    return null
  }

  return `${MONTH_NAMES[month]} ${day}, ${year}`
}

/**
 * Format shoot date range safely.
 *
 * @param {string|null} startDate - 'YYYY-MM-DD'
 * @param {string|null} endDate - 'YYYY-MM-DD'
 * @param {string|null} fallbackTimeline - legacy timeline string
 * @returns {string|null}
 */
export function formatShootDates(startDate, endDate) {
  const formattedStart = formatDateOnly(startDate)
  const formattedEnd = formatDateOnly(endDate)

  if (formattedStart && formattedEnd) {
    if (startDate === endDate) return formattedStart
    return `${formattedStart} – ${formattedEnd}`
  }
  if (formattedStart) {
    return `From ${formattedStart}`
  }
  if (formattedEnd) {
    return `Until ${formattedEnd}`
  }
  return null
}

/**
 * Format budget range with Indian rupee formatting convention.
 *
 * @param {number|string|null} min - minimum budget amount
 * @param {number|string|null} max - maximum budget amount
 * @param {number|string|null} legacyBudget - single legacy budget amount
 * @returns {string|null}
 */
export function formatBudgetRange(min, max, legacyBudget) {
  const hasMin = min !== null && min !== undefined && min !== '' && !isNaN(Number(min))
  const hasMax = max !== null && max !== undefined && max !== '' && !isNaN(Number(max))

  if (hasMin && hasMax) {
    const numMin = Number(min)
    const numMax = Number(max)
    if (numMin === numMax) {
      return `₹${numMin.toLocaleString('en-IN')}`
    }
    return `₹${numMin.toLocaleString('en-IN')} – ₹${numMax.toLocaleString('en-IN')}`
  }

  if (hasMin) {
    return `From ₹${Number(min).toLocaleString('en-IN')}`
  }

  if (hasMax) {
    return `Up to ₹${Number(max).toLocaleString('en-IN')}`
  }

  const hasLegacy = legacyBudget !== null && legacyBudget !== undefined && legacyBudget !== '' && !isNaN(Number(legacyBudget))
  if (hasLegacy) {
    return `₹${Number(legacyBudget).toLocaleString('en-IN')}`
  }

  return null
}

export const MAX_TAGS = 10
export const MAX_TAG_LENGTH = 32

/**
 * Normalizes an array of tags: trims whitespace, removes empties,
 * and deduplicates case-insensitively preserving first-seen display casing.
 * Limits to MAX_TAGS.
 *
 * @param {string[]} tags
 * @returns {string[]}
 */
export function normalizeTags(tags) {
  if (!Array.isArray(tags)) return []
  const seen = new Set()
  const result = []
  for (const item of tags) {
    if (typeof item !== 'string') continue
    const trimmed = item.trim()
    if (!trimmed) continue
    const lower = trimmed.toLowerCase()
    if (!seen.has(lower)) {
      seen.add(lower)
      result.push(trimmed)
      if (result.length >= MAX_TAGS) break
    }
  }
  return result
}

/**
 * Validates and normalizes a candidate tag for addition.
 *
 * @param {string} rawTag
 * @param {string[]} existingTags
 * @returns {{ valid: boolean, error?: string, tag?: string }}
 */
export function validateNewTag(rawTag, existingTags = []) {
  if (typeof rawTag !== 'string') {
    return { valid: false, error: 'Invalid tag.' }
  }
  const trimmed = rawTag.trim()
  if (!trimmed) {
    return { valid: false, error: 'Tag cannot be empty.' }
  }
  if (trimmed.length > MAX_TAG_LENGTH) {
    return { valid: false, error: `Tags must be ${MAX_TAG_LENGTH} characters or less.` }
  }
  if (existingTags.length >= MAX_TAGS) {
    return { valid: false, error: `You can add up to ${MAX_TAGS} tags.` }
  }
  const isDuplicate = existingTags.some(
    (t) => typeof t === 'string' && t.trim().toLowerCase() === trimmed.toLowerCase()
  )
  if (isDuplicate) {
    return { valid: false, error: `Tag "${trimmed}" has already been added.` }
  }
  return { valid: true, tag: trimmed }
}

export const DEFAULT_LOCATION_SUGGESTIONS = [
  'Mumbai',
  'Pune',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Goa',
  'Jaipur',
  'Kochi',
  'Chandigarh',
  'Ahmedabad',
  'Lucknow',
  'Remote',
]

