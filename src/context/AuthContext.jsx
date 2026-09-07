import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from './authContextDef'

// ── Role mapping helpers ──
const DB_ROLE_TO_FRONTEND = { CREATOR: 'creator', COLLABORATOR: 'collaborator' }
const FRONTEND_ROLE_TO_DB = { creator: 'CREATOR', collaborator: 'COLLABORATOR', user: 'COLLABORATOR' }

function mapRoleToFrontend(dbRole) {
  return DB_ROLE_TO_FRONTEND[dbRole] || 'collaborator'
}

function mapRoleToDb(frontendRole) {
  return FRONTEND_ROLE_TO_DB[frontendRole] || 'COLLABORATOR'
}

// ── Idempotent pending skills processing ──
async function processPendingSkills(sessionUser) {
  const rawPending = sessionUser?.user_metadata?.pending_skills
  if (!Array.isArray(rawPending) || rawPending.length === 0) {
    return true
  }

  // Normalize safely: strings only, trimmed, non-empty, de-duplicated
  const normalizedPending = Array.from(
    new Set(
      rawPending
        .filter((s) => typeof s === 'string')
        .map((s) => s.trim())
        .filter(Boolean)
    )
  )

  if (normalizedPending.length === 0) {
    try {
      await supabase.auth.updateUser({ data: { pending_skills: null } })
    } catch (e) {
      console.warn('Failed to clear empty pending_skills metadata:', e)
    }
    return true
  }

  try {
    // Resolve pending names against public.skills in ONE batched query
    const { data: matchedSkills, error: fetchErr } = await supabase
      .from('skills')
      .select('id, name')
      .in('name', normalizedPending)

    if (fetchErr) {
      console.error('Failed to query skills for pending_skills resolution:', fetchErr)
      return false
    }

    // All-names-resolved rule: every normalized pending skill must match a row in public.skills
    const matchedNamesLower = new Set((matchedSkills || []).map((s) => s.name.toLowerCase()))
    const unresolved = normalizedPending.filter(
      (name) => !matchedNamesLower.has(name.toLowerCase())
    )

    if (unresolved.length > 0) {
      console.warn('Pending skills contain unresolved skill names:', unresolved)
      return false
    }

    // Build skill rows for composite key (user_id, skill_id)
    const skillRows = matchedSkills.map((s) => ({
      user_id: sessionUser.id,
      skill_id: s.id,
    }))

    // Idempotent upsert preserving existing skills
    const { error: insertErr } = await supabase
      .from('user_skills')
      .upsert(skillRows, { onConflict: 'user_id,skill_id', ignoreDuplicates: true })

    if (insertErr) {
      console.error('Failed to persist user_skills for pending_skills:', insertErr)
      return false
    }

    // Clear metadata ONLY after DB persistence succeeded
    try {
      await supabase.auth.updateUser({
        data: { pending_skills: null },
      })
    } catch (updateErr) {
      console.warn('Persisted pending skills but failed to clear user_metadata:', updateErr)
    }

    return true
  } catch (err) {
    console.error('Unexpected error in processPendingSkills:', err)
    return false
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [authStatus, setAuthStatus] = useState('loading')
  const [authError, setAuthError] = useState(null)

  // Backward-compatible loading flag: true only while initial session check or retry is resolving
  const loading = authStatus === 'loading'

  const initializedRef = useRef(false)
  const activeHydrationRef = useRef(null)
  const hydrationGenerationRef = useRef(0)

  // ── Centralized, Deduplicated Session Hydration Helper ──
  const hydrateSession = useCallback(async (sessionUser, currentSession) => {
    if (!sessionUser?.id) {
      setSession(null)
      setUser(null)
      setAuthStatus('unauthenticated')
      setAuthError(null)
      return { success: false, status: 'unauthenticated' }
    }

    // Deduplicate in-flight hydration for the same user ID
    if (activeHydrationRef.current && activeHydrationRef.current.userId === sessionUser.id) {
      return activeHydrationRef.current.promise
    }

    const generation = ++hydrationGenerationRef.current

    const hydrationPromise = (async () => {
      try {
        // 1. Query profile row using .maybeSingle()
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .maybeSingle()

        // Guard against stale response if user switched or logged out
        if (generation !== hydrationGenerationRef.current) {
          return { success: false, status: 'stale' }
        }

        // Transient network or server error
        if (profileError) {
          console.error('Error fetching profile:', profileError)
          setSession(currentSession || null)
          setUser(null)
          setAuthStatus('profile-error')
          setAuthError(profileError)
          return { success: false, status: 'profile-error', error: profileError }
        }

        // Definite missing profile row (0 rows returned)
        if (!profile) {
          console.warn('Profile row missing for authenticated user:', sessionUser.id)
          setSession(currentSession || null)
          setUser(null)
          setAuthStatus('profile-missing')
          setAuthError(null)
          return { success: false, status: 'profile-missing' }
        }

        // 2. Process pending skills if present BEFORE fetching user_skills
        if (sessionUser.user_metadata?.pending_skills?.length > 0) {
          await processPendingSkills(sessionUser)
        }

        // Guard against stale response
        if (generation !== hydrationGenerationRef.current) {
          return { success: false, status: 'stale' }
        }

        // 3. Query user_skills in ONE single call
        const { data: userSkills, error: skillsError } = await supabase
          .from('user_skills')
          .select('skill_id, skills(name)')
          .eq('user_id', sessionUser.id)

        if (skillsError) {
          console.warn('Error fetching user skills:', skillsError)
        }

        const skills = (userSkills || []).map((us) => us.skills?.name).filter(Boolean)

        // 4. Construct normalized user profile (uses sessionUser.email directly, no auth.getUser() call)
        const normalizedUser = {
          id: profile.id,
          name: profile.name,
          email: sessionUser.email || '',
          phone: profile.phone || '',
          role: mapRoleToFrontend(profile.role),
          avatar: profile.profile_photo_url || null,
          bio: profile.bio || '',
          location: profile.location || '',
          experienceLevel: profile.experience_level || '',
          availability: profile.availability || '',
          resumeUrl: profile.resume_url || '',
          createdAt: profile.created_at || null,
          skills,
        }

        // Guard against stale response before committing final state
        if (generation !== hydrationGenerationRef.current) {
          return { success: false, status: 'stale' }
        }

        setSession(currentSession || null)
        setUser(normalizedUser)
        setAuthStatus('authenticated')
        setAuthError(null)
        return { success: true, status: 'authenticated', user: normalizedUser }
      } catch (err) {
        if (generation !== hydrationGenerationRef.current) {
          return { success: false, status: 'stale' }
        }
        console.error('Unexpected error in hydrateSession:', err)
        setSession(currentSession || null)
        setUser(null)
        setAuthStatus('profile-error')
        setAuthError(err)
        return { success: false, status: 'profile-error', error: err }
      } finally {
        if (activeHydrationRef.current?.userId === sessionUser.id) {
          activeHydrationRef.current = null
        }
      }
    })()

    activeHydrationRef.current = {
      userId: sessionUser.id,
      promise: hydrationPromise,
    }

    return hydrationPromise
  }, [])

  // ── Session restoration + auth state listener ──
  useEffect(() => {
    // 1. Initial cold-start session restoration (runs once)
    if (!initializedRef.current) {
      initializedRef.current = true

      const restoreSession = async () => {
        try {
          const { data: { session: initialSession } } = await supabase.auth.getSession()
          if (initialSession?.user) {
            setSession(initialSession)
            await hydrateSession(initialSession.user, initialSession)
          } else {
            setSession(null)
            setUser(null)
            setAuthStatus('unauthenticated')
            setAuthError(null)
          }
        } catch (err) {
          console.error('Session restore error:', err)
          setSession(null)
          setUser(null)
          setAuthStatus('unauthenticated')
          setAuthError(err)
        }
      }

      restoreSession()
    }

    // 2. Auth state listener is ALWAYS subscribed on effect setup
    // (survives React StrictMode double-mount in development)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (event === 'SIGNED_IN' && currentSession?.user) {
          setSession(currentSession)
          // Asynchronously trigger central hydration (deduplicated with login() if in-flight)
          hydrateSession(currentSession.user, currentSession)
        } else if (event === 'SIGNED_OUT') {
          hydrationGenerationRef.current++
          activeHydrationRef.current = null
          setSession(null)
          setUser(null)
          setAuthStatus('unauthenticated')
          setAuthError(null)
        } else if (event === 'TOKEN_REFRESHED' && currentSession?.user) {
          // Keep session current without performing redundant profile queries
          setSession(currentSession)
        } else if (event === 'USER_UPDATED' && currentSession?.user) {
          // Keep session metadata (e.g. cleared pending_skills) current without full profile re-query
          setSession(currentSession)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [hydrateSession])

  // ── Login ──
  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    // Await central hydration so LoginPage navigates only after profile classification completes
    if (data?.session?.user) {
      setSession(data.session)
      await hydrateSession(data.session.user, data.session)
    }

    return data
  }, [hydrateSession])

  // ── Register ──
  const register = useCallback(async (email, password, profileData, selectedSkills) => {
    const dbRole = mapRoleToDb(profileData.role)
    const emailRedirectTo = `${window.location.origin}/profile`

    // Sign up with Supabase Auth
    // Profile row is created automatically by the handle_new_user trigger
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          name: profileData.name,
          phone: profileData.phone || null,
          role: dbRole,
          bio: profileData.bio || null,
          location: profileData.location || null,
          experience_level: profileData.experience_level || null,
          availability: profileData.availability || null,
          pending_skills: selectedSkills || [],
        },
      },
    })

    if (authError) {
      throw authError
    }

    const authUser = authData.user
    if (!authUser) {
      throw new Error('Registration failed: no user returned')
    }

    const needsEmailConfirmation = !authData.session
    if (needsEmailConfirmation) {
      return { needsEmailConfirmation: true, email }
    }

    // If an immediate session exists (e.g. email confirmation disabled), hydrate centrally
    setSession(authData.session)
    await hydrateSession(authUser, authData.session)

    return { needsEmailConfirmation: false, user: authUser }
  }, [hydrateSession])

  // ── Logout ──
  const logout = useCallback(async () => {
    hydrationGenerationRef.current++
    activeHydrationRef.current = null
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
    }
    setSession(null)
    setUser(null)
    setAuthStatus('unauthenticated')
    setAuthError(null)
  }, [])

  // ── Retry profile hydration against active session ──
  const retryProfile = useCallback(async () => {
    let targetSession = session
    if (!targetSession) {
      const { data } = await supabase.auth.getSession()
      targetSession = data?.session
    }

    if (targetSession?.user) {
      setAuthStatus('loading')
      activeHydrationRef.current = null
      return await hydrateSession(targetSession.user, targetSession)
    } else {
      setAuthStatus('unauthenticated')
      return { success: false, status: 'unauthenticated' }
    }
  }, [session, hydrateSession])

  // ── Update local user state ──
  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        authStatus,
        authError,
        loading,
        login,
        logout,
        register,
        updateUser,
        retryProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
