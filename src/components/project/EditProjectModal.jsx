import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import RolePickerModal from './RolePickerModal'
import LocationInput from './LocationInput'
import { getRoleOccupancy } from './projectRoleUtils'
import { formatOptions, MAX_TAGS, validateNewTag, normalizeTags } from '../../utils/projectDetailsFormatters'

const GENRE_OPTIONS = [
  'Drama',
  'Sci-Fi',
  'Thriller',
  'Horror',
  'Documentary',
  'Comedy',
  'Action',
  'Romance',
  'Animation',
  'Experimental',
]

const SCRIPT_VISIBILITY_TIERS = [
  {
    value: 'ACCEPTED_TEAM',
    label: 'Accepted Team Only',
    desc: 'Only confirmed team members can view.',
  },
  {
    value: 'APPLICANTS',
    label: 'Applicants & Team',
    desc: 'Pending & accepted applicants can view.',
  },
  {
    value: 'PUBLIC',
    label: 'Anyone Viewing Project',
    desc: 'Public to anyone viewing the project.',
  },
]

const EXPERIENCE_LEVELS = [
  'Beginner',
  'Student',
  'Intermediate',
  'Professional',
]

function clampToMaxNonWhitespace(text, maxNonWhitespace = 1000) {
  if (!text) return ''
  if (text.length <= maxNonWhitespace) return text

  let count = 0
  let cutIndex = text.length
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    const isWhitespace = code === 32 || (code >= 9 && code <= 13)
    if (!isWhitespace) {
      count++
      if (count > maxNonWhitespace) {
        cutIndex = i
        break
      }
    }
  }
  return text.slice(0, cutIndex)
}

function countNonWhitespace(text) {
  if (!text) return 0
  let count = 0
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    if (!(code === 32 || (code >= 9 && code <= 13))) {
      count++
    }
  }
  return count
}

const ProjectTagsEditor = memo(function ProjectTagsEditor({ tags, setTags, disabled }) {
  const [tagInput, setTagInput] = useState('')
  const [tagError, setTagError] = useState('')

  const handleAddTag = (e) => {
    if (e) e.preventDefault()
    if (!tagInput.trim()) return
    const validation = validateNewTag(tagInput, tags)
    if (!validation.valid) {
      setTagError(validation.error)
      return
    }
    setTagError('')
    setTags((prev) => [...prev, validation.tag])
    setTagInput('')
  }

  const handleRemoveTag = (indexToRemove) => {
    setTags((prev) => prev.filter((_, i) => i !== indexToRemove))
    setTagError('')
  }

  const handleClearAllTags = () => {
    setTags([])
    setTagError('')
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className="sm:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
          Tags <span className="text-white/40 font-normal lowercase">(optional)</span>
        </label>
        <div className="flex items-center gap-3">
          {tags.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllTags}
              disabled={disabled}
              className="text-xs text-white/40 hover:text-red-400 transition-colors disabled:opacity-40"
            >
              Clear all
            </button>
          )}
          <span className="text-xs text-white/40">
            {tags.length}/{MAX_TAGS}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => {
            setTagInput(e.target.value)
            if (tagError) setTagError('')
          }}
          onKeyDown={handleTagKeyDown}
          disabled={disabled}
          placeholder="e.g. Student Film, Independent, Festival"
          className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple transition-all text-sm"
        />
        <button
          type="button"
          onClick={handleAddTag}
          disabled={disabled || !tagInput.trim() || tags.length >= MAX_TAGS}
          className="px-5 py-3 bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 text-white text-sm font-medium rounded-xl transition-all duration-200"
        >
          Add
        </button>
      </div>

      {tagError && (
        <p className="text-xs text-red-400 mt-2">{tagError}</p>
      )}

      {/* Tag Pills */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#181818] border border-white/10 rounded-full text-xs text-white/80 font-['DM_Sans',_sans-serif]"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(idx)}
                disabled={disabled}
                className="w-4 h-4 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={`Remove ${tag} tag`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
})

const RoleItemRow = memo(function RoleItemRow({
  roleObj,
  index,
  onCountChange,
  onExperienceChange,
  onRemoveRole,
  disabled,
}) {
  const count = Number(roleObj.positions_needed) || 1
  const minAllowed = Math.max(1, Number(roleObj.positions_filled) || 0)
  const experience = roleObj.experience ?? ''

  return (
    <div className="p-3.5 sm:p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-white">{roleObj.role}</span>
          {roleObj.isNew && (
            <span className="px-2 py-0.5 text-[10px] font-bold text-purple-light bg-purple/10 border border-purple/20 rounded-full">
              New
            </span>
          )}
          {(roleObj.positions_filled || 0) > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              {roleObj.positions_filled} Filled
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRemoveRole(index, roleObj)}
          disabled={disabled || (roleObj.positions_filled || 0) > 0}
          className={`text-xs font-medium px-2 py-1 rounded transition-all shrink-0 ${
            (roleObj.positions_filled || 0) > 0
              ? 'text-white/20 cursor-not-allowed'
              : 'text-red-400/70 hover:text-red-300 hover:bg-red-500/10'
          }`}
          title={(roleObj.positions_filled || 0) > 0 ? 'Cannot remove filled role' : 'Remove role'}
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-white/[0.06]">
        {/* Count Control */}
        <div>
          <span className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">
            Count
          </span>
          <div className="inline-flex items-center bg-[#0C0C11] border border-white/[0.10] rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => onCountChange(index, -1)}
              disabled={disabled || count <= minAllowed}
              className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.05] disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              aria-label="Decrease count"
            >
              −
            </button>
            <span className="w-10 text-center text-xs font-semibold text-white">
              {count}
            </span>
            <button
              type="button"
              onClick={() => onCountChange(index, 1)}
              disabled={disabled}
              className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.05] disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              aria-label="Increase count"
            >
              +
            </button>
          </div>
        </div>

        {/* Experience Level Selector */}
        <div>
          <span className="block text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">
            Experience Level
          </span>
          <div className="relative">
            <select
              value={experience}
              onChange={(e) => onExperienceChange(index, e.target.value)}
              disabled={disabled}
              className="w-full appearance-none px-3 py-1.5 bg-[#0C0C11] border border-white/[0.10] rounded-lg text-xs text-white outline-none transition-all focus:border-purple cursor-pointer pr-8 disabled:opacity-50"
            >
              <option value="" className="bg-[#111118]">
                Any experience
              </option>
              {EXPERIENCE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl} className="bg-[#111118]">
                  {lvl}
                </option>
              ))}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
})


function extractPosterStoragePath(posterUrl, creatorId) {
  if (!posterUrl || typeof posterUrl !== 'string' || !creatorId) {
    return null
  }

  const trimmed = posterUrl.trim()
  if (!trimmed) return null

  // Fast-fail known non-storage / local placeholders
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return null
  }

  const expectedPrefix = `${creatorId}/`

  // Case 1: Full URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed)
      const marker = '/storage/v1/object/public/project-posters/'
      const markerIndex = parsed.pathname.indexOf(marker)
      if (markerIndex === -1) {
        return null
      }

      const rawPath = parsed.pathname.slice(markerIndex + marker.length)
      const decodedPath = decodeURIComponent(rawPath)

      if (decodedPath.startsWith(expectedPrefix)) {
        return decodedPath
      }
      return null
    } catch {
      return null
    }
  }

  // Case 2: Optional legacy relative path (strictly must begin with creatorId/)
  if (trimmed.startsWith(expectedPrefix)) {
    return decodeURIComponent(trimmed)
  }

  return null
}

export default function EditProjectModal({ isOpen, onClose, project, onSaveSuccess }) {
  const [title, setTitle] = useState('')
  const [logline, setLogline] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('Drama')
  const [location, setLocation] = useState('')
  const [format, setFormat] = useState('')
  const [shootStartDate, setShootStartDate] = useState('')
  const [shootEndDate, setShootEndDate] = useState('')
  const [language, setLanguage] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [clearLegacyBudget, setClearLegacyBudget] = useState(false)
  const [target, setTarget] = useState('')
  const [tags, setTags] = useState([])
  const [scriptVisibility, setScriptVisibility] = useState('ACCEPTED_TEAM')
  const [rolesList, setRolesList] = useState([])
  const [rolesToDelete, setRolesToDelete] = useState([])
  const [isRolePickerOpen, setIsRolePickerOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [newScriptFile, setNewScriptFile] = useState(null)
  const [scriptError, setScriptError] = useState('')
  const fileInputRef = useRef(null)
  const [newPosterFile, setNewPosterFile] = useState(null)
  const [newPosterPreview, setNewPosterPreview] = useState(null)
  const [posterError, setPosterError] = useState('')
  const posterInputRef = useRef(null)
  const posterBlobUrlRef = useRef(null)
  const prevProjectIdRef = useRef(null)
  const prevIsOpenRef = useRef(false)

  useEffect(() => {
    const isOpening = isOpen && !prevIsOpenRef.current
    const isDifferentProject = project?.id && project.id !== prevProjectIdRef.current

    if (isOpen && project && (isOpening || isDifferentProject)) {
      prevProjectIdRef.current = project.id
      setTitle(project.title || '')
      setLogline(project.logline || '')
      setDescription(project.description || '')
      setGenre(project.genre || 'Drama')
      setLocation(project.location || '')
      setFormat(project.format || '')
      setShootStartDate(project.shoot_start_date || '')
      setShootEndDate(project.shoot_end_date || '')
      setLanguage(project.language || '')
      setBudgetMin(project.budget_min != null ? String(project.budget_min) : '')
      setBudgetMax(project.budget_max != null ? String(project.budget_max) : '')
      setClearLegacyBudget(false)
      setTarget(project.target || '')
      setTags(Array.isArray(project.tags) ? [...project.tags] : [])
      setScriptVisibility(project.script_visibility || 'ACCEPTED_TEAM')
      setNewScriptFile(null)
      setScriptError('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Reset poster selection
      if (posterBlobUrlRef.current) {
        URL.revokeObjectURL(posterBlobUrlRef.current)
        posterBlobUrlRef.current = null
      }
      setNewPosterFile(null)
      setNewPosterPreview(null)
      setPosterError('')
      if (posterInputRef.current) {
        posterInputRef.current.value = ''
      }

      const raw = Array.isArray(project.rawRoles) ? project.rawRoles : []
      setRolesList(raw.map((r) => {
        const { acceptedCount, isAvailable } = getRoleOccupancy(r, project.applicants, { isCreator: true })
        const safeFilled = isAvailable && acceptedCount != null ? acceptedCount : 0
        const expVal = r.experience_level !== undefined ? r.experience_level : (r.experience !== undefined ? r.experience : null)
        return {
          id: r.id,
          role: r.role,
          positions_needed: Math.max(safeFilled || 1, Number(r.positions_needed) || 1),
          positions_filled: safeFilled,
          experience: expVal,
          isNew: false
        }
      }))
      setRolesToDelete([])
      setErrorMsg('')
    }
    prevIsOpenRef.current = isOpen
  }, [project, isOpen])

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (posterBlobUrlRef.current) {
        URL.revokeObjectURL(posterBlobUrlRef.current)
        posterBlobUrlRef.current = null
      }
    }
  }, [])

  const handlePosterFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPosterError('')

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
    const hasValidExt = /\.(jpe?g|png|webp)$/i.test(file.name)
    if (!allowedMimeTypes.includes(file.type) || !hasValidExt) {
      setPosterError('Poster must be a JPG, PNG, or WebP image.')
      e.target.value = ''
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setPosterError('Poster must be 10 MB or smaller.')
      e.target.value = ''
      return
    }

    if (posterBlobUrlRef.current) {
      URL.revokeObjectURL(posterBlobUrlRef.current)
      posterBlobUrlRef.current = null
    }

    const previewUrl = URL.createObjectURL(file)
    posterBlobUrlRef.current = previewUrl
    setNewPosterFile(file)
    setNewPosterPreview(previewUrl)
  }

  const handleCancelPoster = () => {
    if (posterBlobUrlRef.current) {
      URL.revokeObjectURL(posterBlobUrlRef.current)
      posterBlobUrlRef.current = null
    }
    setNewPosterFile(null)
    setNewPosterPreview(null)
    setPosterError('')
    if (posterInputRef.current) {
      posterInputRef.current.value = ''
    }
  }

  const handleScriptFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScriptError('')

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setScriptError('Script must be a PDF file.')
      e.target.value = ''
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      setScriptError('Script must be 25 MB or smaller.')
      e.target.value = ''
      return
    }

    setNewScriptFile(file)
  }

  const handleDescriptionChange = (e) => {
    const clamped = clampToMaxNonWhitespace(e.target.value, 1000)
    setDescription(clamped)
  }

  const handleRoleCountChange = useCallback((index, delta) => {
    setRolesList((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r
        const current = Number(r.positions_needed) || 1
        const minAllowed = Math.max(1, Number(r.positions_filled) || 0)
        const newCount = Math.max(minAllowed, current + delta)
        return { ...r, positions_needed: newCount }
      })
    )
  }, [])

  const handleRoleExperienceChange = useCallback((index, newExp) => {
    const normalized = (!newExp || newExp === 'Any experience') ? null : newExp
    setRolesList((prev) =>
      prev.map((r, i) => (i === index ? { ...r, experience: normalized } : r))
    )
  }, [])

  const handleRemoveRole = useCallback((index, roleObj) => {
    if ((roleObj.positions_filled || 0) > 0) {
      setErrorMsg(`Cannot remove "${roleObj.role}" because positions have already been filled.`)
      return
    }
    setErrorMsg('')
    if (roleObj.id && !roleObj.isNew) {
      setRolesToDelete((prev) => [...prev, roleObj.id])
    }
    setRolesList((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSelectRole = useCallback((canonicalRoleName) => {
    setRolesList((prev) => {
      if (prev.some((r) => r.role.toLowerCase() === canonicalRoleName.toLowerCase())) {
        setErrorMsg('Role already exists in list')
        return prev
      }
      setErrorMsg('')
      return [
        ...prev,
        {
          role: canonicalRoleName,
          positions_needed: 1,
          positions_filled: 0,
          experience: 'Intermediate',
          isNew: true
        }
      ]
    })
  }, [])

  const selectedRoleNames = useMemo(() => rolesList.map((r) => r.role), [rolesList])
  const descriptionCount = useMemo(() => countNonWhitespace(description), [description])

  if (!isOpen || !project) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setErrorMsg('Project title is required.')
      return
    }
    if (!logline.trim()) {
      setErrorMsg('Logline is required.')
      return
    }
    if (logline.length > 90) {
      setErrorMsg('Logline must be 90 characters or less.')
      return
    }
    if (!description.trim()) {
      setErrorMsg('Description is required.')
      return
    }
    if (description.replace(/\s/g, '').length > 1000) {
      setErrorMsg('Description must be 1000 characters or less, excluding spaces.')
      return
    }
    if (!location.trim()) {
      setErrorMsg('Location is required.')
      return
    }

    // Validate role counts
    for (const r of rolesList) {
      const count = Number(r.positions_needed)
      if (isNaN(count) || count < 1) {
        setErrorMsg(`Role "${r.role}" must have a count of at least 1.`)
        return
      }
      const minAllowed = Math.max(1, Number(r.positions_filled) || 0)
      if (count < minAllowed) {
        setErrorMsg(`You already have ${r.positions_filled} accepted collaborator${r.positions_filled > 1 ? 's' : ''} for "${r.role}". Count cannot be reduced below ${r.positions_filled}.`)
        return
      }
    }

    // Validate shoot dates
    if (shootStartDate && shootEndDate && shootEndDate < shootStartDate) {
      setErrorMsg('Shoot end date must not be earlier than start date.')
      return
    }

    // Validate budget range
    if (budgetMin !== '' && budgetMin != null) {
      const minNum = Number(budgetMin)
      if (isNaN(minNum) || !isFinite(minNum) || minNum < 0) {
        setErrorMsg('Minimum budget must be a valid positive number.')
        return
      }
    }
    if (budgetMax !== '' && budgetMax != null) {
      const maxNum = Number(budgetMax)
      if (isNaN(maxNum) || !isFinite(maxNum) || maxNum < 0) {
        setErrorMsg('Maximum budget must be a valid positive number.')
        return
      }
    }
    if (
      budgetMin !== '' &&
      budgetMin != null &&
      budgetMax !== '' &&
      budgetMax != null
    ) {
      if (Number(budgetMax) < Number(budgetMin)) {
        setErrorMsg('Maximum budget must not be less than minimum budget.')
        return
      }
    }

    let uploadedPosterPath = null
    let uploadedPosterPublicUrl = null
    let uploadedScriptPath = null
    try {
      setIsSaving(true)
      setErrorMsg('')
      setPosterError('')
      setScriptError('')

      // 0. Verify active Supabase session and creator ownership before any upload/update
      const { data: { session } } = await supabase.auth.getSession()
      const activeUserId = session?.user?.id

      if (!session || !activeUserId || activeUserId !== project.creator_id) {
        throw new Error('Authentication required. You can only edit projects you created.')
      }

      // 1. Upload new poster if a file was selected
      if (newPosterFile) {
        const fileExt = (newPosterFile.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '')
        const sanitizedFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
        const posterFilePath = `${activeUserId}/${sanitizedFileName}`

        const { error: posterUploadError } = await supabase.storage
          .from('project-posters')
          .upload(posterFilePath, newPosterFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (posterUploadError) {
          setPosterError('Could not upload the new poster. Your current poster has not been changed.')
          throw new Error('Could not upload the new poster. Your current poster has not been changed.')
        }

        uploadedPosterPath = posterFilePath

        const { data: publicUrlData } = supabase.storage
          .from('project-posters')
          .getPublicUrl(posterFilePath)

        if (!publicUrlData?.publicUrl) {
          try {
            await supabase.storage.from('project-posters').remove([posterFilePath])
          } catch (cleanErr) {
            console.warn('Failed to clean up poster after public URL failure:', cleanErr)
          }
          setPosterError('Could not obtain public URL for the new poster. Your current poster has not been changed.')
          throw new Error('Could not obtain public URL for the new poster. Your current poster has not been changed.')
        }

        uploadedPosterPublicUrl = publicUrlData.publicUrl
      }

      // 2. Upload new script if a file was selected
      if (newScriptFile) {
        const sanitizedFileName = `${Date.now()}_${newScriptFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const scriptFilePath = `${activeUserId}/${sanitizedFileName}`

        const { error: scriptUploadError } = await supabase.storage
          .from('scripts')
          .upload(scriptFilePath, newScriptFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (scriptUploadError) {
          // Clean up newly uploaded poster if script upload failed to prevent orphaned storage object
          if (uploadedPosterPath) {
            try {
              await supabase.storage.from('project-posters').remove([uploadedPosterPath])
            } catch (cleanErr) {
              console.warn('Failed to clean up newly uploaded poster after script upload error:', cleanErr)
            }
            uploadedPosterPath = null
          }
          throw new Error('Unable to upload the new script. Your existing project was not changed.')
        }

        uploadedScriptPath = scriptFilePath
      }

      // 3. UPDATE projects record
      const bMin = budgetMin === '' || budgetMin == null ? null : Number(budgetMin)
      const bMax = budgetMax === '' || budgetMax == null ? null : Number(budgetMax)
      const hasLegacyBudget = project?.budget != null && project?.budget !== '' && !isNaN(Number(project?.budget)) && project?.budget_min == null && project?.budget_max == null
      let finalBudget = null
      if (bMin != null || bMax != null) {
        // Project uses the modern budget range representation (min and/or max).
        // Legacy single budget amount is null so it does not misrepresent the range.
        finalBudget = null
      } else if (hasLegacyBudget && !clearLegacyBudget) {
        // Existing legacy project with single budget amount, edited without adding a range or clearing:
        // preserve the existing legacy budget value.
        finalBudget = typeof project.budget === 'number' ? project.budget : (isNaN(Number(project.budget)) ? project.budget : Number(project.budget))
      } else {
        // Budget range was cleared, legacy budget was intentionally cleared, or project has no budget.
        finalBudget = null
      }

      const updatePayload = {
        title: title.trim(),
        logline: logline.trim(),
        description: description.trim(),
        genre,
        location: location.trim(),
        format: format || null,
        shoot_start_date: shootStartDate || null,
        shoot_end_date: shootEndDate || null,
        language: language.trim() || null,
        budget_min: bMin,
        budget_max: bMax,
        budget: finalBudget,
        target: target.trim() || null,
        tags: normalizeTags(tags),
        script_visibility: scriptVisibility,
      }

      if (uploadedPosterPublicUrl) {
        updatePayload.poster_url = uploadedPosterPublicUrl
      }

      if (uploadedScriptPath) {
        updatePayload.script_url = uploadedScriptPath
      }

      const { error: updateErr } = await supabase
        .from('projects')
        .update(updatePayload)
        .eq('id', project.id)
        .eq('creator_id', activeUserId)
        .select('id')
        .single()

      if (updateErr) {
        // Rollback uploaded files if DB update fails to avoid orphaned storage files
        if (uploadedPosterPath) {
          try {
            await supabase.storage.from('project-posters').remove([uploadedPosterPath])
          } catch (cleanupErr) {
            console.warn('Failed to clean up newly uploaded poster after project update error:', cleanupErr)
          }
        }
        if (uploadedScriptPath) {
          try {
            await supabase.storage.from('scripts').remove([uploadedScriptPath])
          } catch (cleanupErr) {
            console.warn('Failed to clean up newly uploaded script after project update error:', cleanupErr)
          }
        }
        throw new Error('Unable to update project. Your existing poster and script were not changed.')
      }

      // 4. Clean up old poster object ONLY after DB update succeeds
      if (uploadedPosterPath) {
        const oldPosterStoragePath = extractPosterStoragePath(project.poster_url, activeUserId)
        if (oldPosterStoragePath && oldPosterStoragePath !== uploadedPosterPath) {
          try {
            const { error: removeOldPosterError } = await supabase.storage
              .from('project-posters')
              .remove([oldPosterStoragePath])
            if (removeOldPosterError) {
              console.warn('Failed to remove previous project poster from storage:', removeOldPosterError)
            }
          } catch (oldPosterCleanupErr) {
            console.warn('Old poster cleanup was not performed:', oldPosterCleanupErr)
          }
        }
      }

      // 5. Clean up old script object ONLY after DB update succeeds
      if (uploadedScriptPath && project.script_url && project.script_url !== uploadedScriptPath) {
        try {
          await supabase.storage.from('scripts').remove([project.script_url])
        } catch (oldCleanupErr) {
          console.warn('Old script cleanup was not performed because privacy policies were preserved:', oldCleanupErr)
        }
      }

      // 4. DELETE removed existing roles
      if (rolesToDelete.length > 0) {
        const { error: delErr } = await supabase
          .from('project_roles')
          .delete()
          .in('id', rolesToDelete)

        if (delErr) throw delErr
      }

      // 5. UPDATE existing roles with updated counts
      // 5. UPDATE existing roles only if their count or experience actually changed
      const rawRoles = Array.isArray(project.rawRoles) ? project.rawRoles : []
      const existingRolesToUpdate = rolesList.filter((r) => {
        if (!r.id || r.isNew) return false
        const orig = rawRoles.find((o) => o.id === r.id)
        if (!orig) return true
        const origCount = Number(orig.positions_needed) || 1
        const origExp = orig.experience_level !== undefined ? orig.experience_level : (orig.experience !== undefined ? orig.experience : null)
        const currCount = Number(r.positions_needed) || 1
        const currExp = r.experience ?? null
        return currCount !== origCount || currExp !== origExp
      })

      if (existingRolesToUpdate.length > 0) {
        await Promise.all(
          existingRolesToUpdate.map(async (r) => {
            const count = Math.max(1, Number(r.positions_needed) || 1)
            const { error: updErr } = await supabase
              .from('project_roles')
              .update({
                positions_needed: count,
                experience_level: r.experience ? r.experience : null,
              })
              .eq('id', r.id)
              .eq('project_id', project.id)

            if (updErr) throw updErr
          })
        )
      }

      // 6. INSERT new roles
      const rolesToAdd = rolesList.filter((r) => r.isNew || !r.id)
      if (rolesToAdd.length > 0) {
        const payload = rolesToAdd.map((r) => ({
          project_id: project.id,
          role: r.role.trim(),
          positions_needed: Math.max(1, Number(r.positions_needed) || 1),
          positions_filled: 0,
          experience_level: r.experience ? r.experience : null,
        }))

        const { error: insErr } = await supabase
          .from('project_roles')
          .insert(payload)

        if (insErr) throw insErr
      }

      if (posterBlobUrlRef.current) {
        URL.revokeObjectURL(posterBlobUrlRef.current)
        posterBlobUrlRef.current = null
      }
      setNewPosterFile(null)
      setNewPosterPreview(null)

      onSaveSuccess()
    } catch (err) {
      console.error('Error updating project:', err)
      setErrorMsg(err.message || 'Failed to update project.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl transform-gpu">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit Project & Roles
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1 text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all"
              placeholder="e.g. Echoes of Silence"
              required
            />
          </div>

          {/* Logline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">Logline *</label>
              <span className="text-xs text-white/30">{logline.length}/90</span>
            </div>
            <textarea
              rows={2}
              maxLength={90}
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all resize-none"
              placeholder="Short pitch of your film project..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">Description *</label>
              <span className="text-xs text-white/30">{descriptionCount}/1000</span>
            </div>
            <textarea
              rows={6}
              value={description}
              onChange={handleDescriptionChange}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all resize-none"
              placeholder="Full project description, story, vision, or background..."
              required
            />
          </div>

          {/* Project Details Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple transition-all"
              >
                <option value="">Select format</option>
                {formatOptions.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple transition-all"
              >
                {GENRE_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edit-location" className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Location *</label>
              <LocationInput
                id="edit-location"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, Pune or Remote"
                required
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple transition-all text-sm pr-10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Language</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple transition-all"
                placeholder="e.g. Hindi, English"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Shoot Start Date</label>
              <input
                type="date"
                value={shootStartDate}
                onChange={(e) => setShootStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple transition-all [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Shoot End Date</label>
              <input
                type="date"
                value={shootEndDate}
                onChange={(e) => setShootEndDate(e.target.value)}
                min={shootStartDate || undefined}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple transition-all [color-scheme:dark]"
              />
            </div>

            {/* Legacy budget indicator and clear action */}
            {project?.budget != null && project?.budget !== '' && !isNaN(Number(project?.budget)) && project?.budget_min == null && project?.budget_max == null && !budgetMin && !budgetMax && (
              <div className="sm:col-span-2">
                {!clearLegacyBudget ? (
                  <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-xs">
                    <div className="flex items-center gap-2 flex-wrap text-white/70">
                      <span>Current saved budget:</span>
                      <span className="font-semibold text-emerald-400">
                        ₹{Number(project.budget).toLocaleString('en-IN')}
                      </span>
                      <span className="text-white/40">(legacy amount)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setClearLegacyBudget(true)}
                      className="text-xs text-red-400 hover:text-red-300 font-medium px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors shrink-0"
                    >
                      Clear Budget
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs">
                    <span className="text-red-300">
                      Legacy budget will be cleared on save.
                    </span>
                    <button
                      type="button"
                      onClick={() => setClearLegacyBudget(false)}
                      className="text-xs text-white/70 hover:text-white font-medium px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                    >
                      Undo
                    </button>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Min Budget (₹)</label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => {
                  setBudgetMin(e.target.value)
                  if (clearLegacyBudget) setClearLegacyBudget(false)
                }}
                placeholder="e.g. 100000"
                min="0"
                step="any"
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Max Budget (₹)</label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => {
                  setBudgetMax(e.target.value)
                  if (clearLegacyBudget) setClearLegacyBudget(false)
                }}
                placeholder="e.g. 500000"
                min="0"
                step="any"
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Target Goals / Festivals</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. Film festivals, streaming, theatrical"
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple transition-all"
              />
            </div>

            <ProjectTagsEditor tags={tags} setTags={setTags} disabled={isSaving} />
          </div>

          {/* Project Poster Section */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
                Project Poster
              </label>
              <span className="text-xs text-white/40">
                JPG, PNG, WebP · Max 10MB
              </span>
            </div>
            <p className="text-xs text-white/40 mb-3">
              Recommended 1200 × 1800 px (2:3)
            </p>

            {/* Hidden file input */}
            <input
              ref={posterInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePosterFileChange}
              className="sr-only"
              id="edit-project-poster-file"
            />

            {/* Poster card container */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Portrait preview 2:3 ratio */}
                <div className="w-20 sm:w-24 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 bg-[#0C0C11] shrink-0 relative shadow-md">
                  <img
                    src={newPosterPreview || project.poster_url || '/images/hero-bg.png'}
                    alt={newPosterFile ? 'New poster preview' : `${project.title || 'Project'} poster`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  {newPosterFile ? (
                    <>
                      <div className="text-xs font-medium text-white/50 mb-0.5">
                        Selected poster:
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-white truncate max-w-full" title={newPosterFile.name}>
                          {newPosterFile.name}
                        </span>
                        <span className="text-xs text-white/40 font-mono">
                          ({(newPosterFile.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple/20 text-purple-light border border-purple/30">
                          Ready to replace on save
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-semibold text-white block mb-0.5">
                        Current poster
                      </span>
                      <p className="text-xs text-white/40">
                        Recommended 1200 × 1800 · 2:3
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                {newPosterFile ? (
                  <>
                    <button
                      type="button"
                      onClick={() => posterInputRef.current?.click()}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-xs font-medium text-white transition-all disabled:opacity-50"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelPoster}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => posterInputRef.current?.click()}
                    disabled={isSaving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple/20 hover:bg-purple/30 border border-purple/40 text-xs font-semibold text-purple-light hover:text-white transition-all shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span>Replace Poster</span>
                  </button>
                )}
              </div>
            </div>

            {posterError && (
              <p className="mt-2 text-xs text-red-400">
                {posterError}
              </p>
            )}
          </div>

          {/* Script Section */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
                Script
              </label>
              <span className="text-xs text-white/40">
                PDF only · Maximum 25 MB
              </span>
            </div>
            <p className="text-xs text-white/40 mb-3">
              Upload or replace your project screenplay.
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleScriptFileChange}
              className="sr-only"
              id="edit-project-script-file"
              aria-describedby="script-file-help"
            />

            {/* Script card container */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {newScriptFile ? (
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-purple/20 text-purple-light flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-white/50 mb-0.5">
                      Selected script:
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white truncate max-w-full" title={newScriptFile.name}>
                        {newScriptFile.name}
                      </span>
                      <span className="text-xs text-white/40 font-mono">
                        ({(newScriptFile.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple/20 text-purple-light border border-purple/30">
                        Ready to upload on save
                      </span>
                    </div>
                    <p id="script-file-help" className="text-xs text-white/40 mt-1">
                      Click Save Changes to apply.
                    </p>
                  </div>
                </div>
              ) : project.script_url ? (
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-white block mb-0.5">
                      ✓ Script uploaded
                    </span>
                    <p id="script-file-help" className="text-xs text-white/40">
                      Upload a new PDF to replace the current screenplay.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] text-white/30 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-white/80 block mb-0.5">
                      No script uploaded
                    </span>
                    <p id="script-file-help" className="text-xs text-white/40">
                      PDF only · Maximum 25 MB
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                {newScriptFile ? (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-xs font-medium text-white transition-all"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewScriptFile(null)
                        setScriptError('')
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 transition-all"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSaving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple/20 hover:bg-purple/30 border border-purple/40 text-xs font-semibold text-purple-light hover:text-white transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span>{project.script_url ? 'Replace Script' : 'Upload Script'}</span>
                  </button>
                )}
              </div>
            </div>

            {scriptError && (
              <p className="mt-2 text-xs text-red-400">
                {scriptError}
              </p>
            )}
          </div>

          {/* Script Access Privacy Selector */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
                Script Access
              </label>
              <span className="text-xs text-white/40">
                {newScriptFile ? 'Screenplay attached (pending save)' : project.script_url ? 'Screenplay attached' : 'No screenplay attached'}
              </span>
            </div>
            <p className="text-xs text-white/40 mb-3">
              Configure who can view and read this project's screenplay.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SCRIPT_VISIBILITY_TIERS.map((tier) => {
                const isSelected = scriptVisibility === tier.value
                return (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() => setScriptVisibility(tier.value)}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#18122B] border-purple shadow-[0_0_15px_rgba(98,57,191,0.2)]'
                        : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div>
                      <span className={`text-xs font-semibold block mb-1 ${isSelected ? 'text-white' : 'text-white/80'}`}>
                        {tier.label}
                      </span>
                      <span className="text-[10px] text-white/40 leading-tight block">
                        {tier.desc}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px]">
                      <span className={`w-2.5 h-2.5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-purple bg-purple' : 'border-white/30'
                      }`}>
                        {isSelected && <span className="w-1 h-1 rounded-full bg-white" />}
                      </span>
                      <span className={isSelected ? 'text-purple-light font-medium' : 'text-white/30'}>
                        {isSelected ? 'Active' : 'Select'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Manage Roles Section */}
          <div className="pt-4 border-t border-white/10">
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Project Roles Management</label>

            {/* Existing and Added Roles List */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
              {rolesList.length > 0 ? (
                rolesList.map((r, idx) => (
                  <RoleItemRow
                    key={r.id || `new-${idx}`}
                    roleObj={r}
                    index={idx}
                    onCountChange={handleRoleCountChange}
                    onExperienceChange={handleRoleExperienceChange}
                    onRemoveRole={handleRemoveRole}
                    disabled={isSaving}
                  />
                ))
              ) : (
                <p className="text-white/30 text-xs py-2">No roles currently listed.</p>
              )}
            </div>

            {/* Add Role Trigger */}
            <button
              type="button"
              onClick={() => setIsRolePickerOpen(true)}
              className="w-full py-2.5 px-4 bg-white/[0.04] hover:bg-purple/15 border border-dashed border-white/15 hover:border-purple/40 rounded-xl text-xs font-semibold text-white/80 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span className="text-purple-light font-bold">+</span>
              <span>{rolesList.length === 0 ? 'Add Role' : 'Add Another Role'}</span>
            </button>
          </div>

          {/* Role Picker Modal */}
          {isRolePickerOpen && (
            <RolePickerModal
              isOpen={isRolePickerOpen}
              onClose={() => setIsRolePickerOpen(false)}
              onSelectRole={handleSelectRole}
              selectedRoleNames={selectedRoleNames}
            />
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(98,57,191,0.4)] disabled:opacity-50"
            >
              {isSaving && (
                <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
              )}
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
