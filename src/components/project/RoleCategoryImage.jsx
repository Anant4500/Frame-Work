import { useState } from 'react'
import { getRoleCategoryImage } from '../../data/roleCategoryImages'

/**
 * RoleCategoryImage
 * Renders the 48x48 category artwork for a given film role.
 * If the role is unknown/unmatched or if the image fails to load,
 * it returns null so the parent card cleanly falls back to text-only layout.
 *
 * @param {{ role: string }} props
 */
export default function RoleCategoryImage({ role }) {
  const [hasError, setHasError] = useState(false)
  const imageSrc = getRoleCategoryImage(role)

  if (!imageSrc || hasError) {
    return null
  }

  const isCamera = imageSrc.includes('camera.png')

  return (
    <div
      className="w-[52px] h-[52px] sm:w-14 sm:h-14 shrink-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <img
        src={imageSrc}
        alt=""
        aria-hidden="true"
        className={`w-full h-full object-contain pointer-events-none select-none ${
          isCamera ? 'scale-[1.12]' : ''
        }`}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  )
}
