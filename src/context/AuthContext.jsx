import { createContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

export const AuthContext = createContext(null)

// ── Role mapping helpers ──
const DB_ROLE_TO_FRONTEND = { CREATOR: 'creator', COLLABORATOR: 'collaborator' }
const FRONTEND_ROLE_TO_DB = { creator: 'CREATOR', collaborator: 'COLLABORATOR', user: 'COLLABORATOR' }

function mapRoleToFrontend(dbRole) {
  return DB_ROLE_TO_FRONTEND[dbRole] || 'collaborator'
}

function mapRoleToDb(frontendRole) {
  return FRONTEND_ROLE_TO_DB[frontendRole] || 'COLLABORATOR'
}

// ── Fetch profile + skills from Supabase ──
async function fetchUserProfile(userId) {
  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    console.error('Error fetching profile:', profileError)
    return null
  }

  // Fetch skills via user_skills join
  const { data: userSkills, error: skillsError } = await supabase
    .from('user_skills')
    .select('skill_id, skills(name)')
    .eq('user_id', userId)

  if (skillsError) {
    console.error('Error fetching user skills:', skillsError)
  }

  const skills = (Array.isArray(profile.skills) && profile.skills.length > 0)
    ? profile.skills
    : (userSkills || []).map((us) => us.skills?.name).filter(Boolean)

  // Get the auth user for email
  const { data: { user: authUser } } = await supabase.auth.getUser()

  return {
    id: profile.id,
    name: profile.name,
    email: authUser?.email || '',
    phone: profile.phone || '',
    role: mapRoleToFrontend(profile.role),
    avatar: profile.profile_photo_url || null,
    bio: profile.bio || '',
    location: profile.location || '',
    experienceLevel: profile.experience_level || '',
    availability: profile.availability || '',
    resumeUrl: profile.resume_url || '',
    skills,
  }
}

// ── Insert user_skills for a user ──
async function insertUserSkills(userId, selectedSkills) {
  if (!selectedSkills || selectedSkills.length === 0) return

  // Fetch all skills to get IDs by name
  const { data: allSkills, error: skillsFetchError } = await supabase
    .from('skills')
    .select('id, name')

  if (skillsFetchError) {
    console.error('Error fetching skills:', skillsFetchError)
    return
  }

  // Match selected skill names to skill IDs
  const skillRows = selectedSkills
    .map((skillName) => {
      const match = allSkills.find(
        (s) => s.name.toLowerCase() === skillName.toLowerCase()
      )
      return match ? { user_id: userId, skill_id: match.id } : null
    })
    .filter(Boolean)

  if (skillRows.length > 0) {
    const { error: insertSkillsError } = await supabase
      .from('user_skills')
      .insert(skillRows)

    if (insertSkillsError) {
      console.error('Error inserting user skills:', insertSkillsError)
    }
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)

  // ── Session restoration + auth state listener ──
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    // 1. Restore existing session on mount
    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id)
          if (profile) {
            setUser(profile)

            // Check if user has pending skills to insert (stored in user metadata)
            const pendingSkills = session.user.user_metadata?.pending_skills
            if (pendingSkills && pendingSkills.length > 0) {
              // Check if user already has skills
              const { data: existingSkills } = await supabase
                .from('user_skills')
                .select('skill_id')
                .eq('user_id', session.user.id)

              if (!existingSkills || existingSkills.length === 0) {
                await insertUserSkills(session.user.id, pendingSkills)
                // Clear pending skills from metadata
                await supabase.auth.updateUser({
                  data: { pending_skills: null },
                })
                // Re-fetch profile to include skills
                const updatedProfile = await fetchUserProfile(session.user.id)
                if (updatedProfile) {
                  setUser(updatedProfile)
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Session restore error:', err)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user.id)
          if (profile) {
            setUser(profile)
          }

          // Handle pending skills (e.g., after email confirmation)
          const pendingSkills = session.user.user_metadata?.pending_skills
          if (pendingSkills && pendingSkills.length > 0) {
            const { data: existingSkills } = await supabase
              .from('user_skills')
              .select('skill_id')
              .eq('user_id', session.user.id)

            if (!existingSkills || existingSkills.length === 0) {
              await insertUserSkills(session.user.id, pendingSkills)
              await supabase.auth.updateUser({
                data: { pending_skills: null },
              })
              const updatedProfile = await fetchUserProfile(session.user.id)
              if (updatedProfile) {
                setUser(updatedProfile)
              }
            }
          }

          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const profile = await fetchUserProfile(session.user.id)
          if (profile) {
            setUser(profile)
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // ── Login ──
  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    // Profile will be loaded by onAuthStateChange SIGNED_IN event,
    // but we also load it here for immediate availability
    if (data.user) {
      const profile = await fetchUserProfile(data.user.id)
      if (profile) {
        setUser(profile)
      }

      // Handle pending skills on first login after email confirmation
      const pendingSkills = data.user.user_metadata?.pending_skills
      if (pendingSkills && pendingSkills.length > 0) {
        const { data: existingSkills } = await supabase
          .from('user_skills')
          .select('skill_id')
          .eq('user_id', data.user.id)

        if (!existingSkills || existingSkills.length === 0) {
          await insertUserSkills(data.user.id, pendingSkills)
          await supabase.auth.updateUser({
            data: { pending_skills: null },
          })
          const updatedProfile = await fetchUserProfile(data.user.id)
          if (updatedProfile) {
            setUser(updatedProfile)
          }
        }
      }
    }

    return data
  }, [])

  // ── Register ──
  const register = useCallback(async (email, password, profileData, selectedSkills) => {
    const dbRole = mapRoleToDb(profileData.role)

    // 1. Sign up with Supabase Auth
    //    Profile is created automatically by the handle_new_user trigger
    //    We pass profile data as user metadata so the trigger can read it
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: profileData.name,
          phone: profileData.phone || null,
          role: dbRole,
          bio: profileData.bio || null,
          location: profileData.location || null,
          experience_level: profileData.experience_level || null,
          availability: profileData.availability || null,
          profile_photo_url: profileData.profile_photo_url || null,
          resume_url: profileData.resume_url || null,
          // Store pending skills in metadata for insertion after email confirmation
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

    // 2. Check if email confirmation is required
    const needsEmailConfirmation = !authData.session

    if (needsEmailConfirmation) {
      // Skills will be inserted on first login after email confirmation
      return { needsEmailConfirmation: true, email }
    }

    // 3. If no confirmation needed, we have a session — insert skills now
    if (selectedSkills && selectedSkills.length > 0) {
      await insertUserSkills(authUser.id, selectedSkills)
      // Clear pending skills from metadata since we've inserted them
      await supabase.auth.updateUser({
        data: { pending_skills: null },
      })
    }

    // 4. Build user object immediately
    const skills = selectedSkills || []
    setUser({
      id: authUser.id,
      name: profileData.name,
      email,
      phone: profileData.phone || '',
      role: profileData.role === 'creator' ? 'creator' : 'collaborator',
      avatar: profileData.profile_photo_url || null,
      bio: profileData.bio || '',
      location: profileData.location || '',
      experienceLevel: profileData.experience_level || '',
      skills,
    })

    return { needsEmailConfirmation: false }
  }, [])

  // ── Logout ──
  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
    }
    setUser(null)
    // Clean up old localStorage keys that are no longer the source of truth
    localStorage.removeItem('fw_user')
    localStorage.removeItem('fw_registered_users')
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}
