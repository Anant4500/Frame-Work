import { useEffect } from 'react'

/**
 * Shared hook to set the document title
 * @param {string} title - The page title string (e.g. "Profile | FrameWork")
 */
export function usePageTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = title
    }
  }, [title])
}

export default usePageTitle
