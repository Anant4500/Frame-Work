import { useState, useRef, useEffect, useMemo, memo } from 'react'
import { DEFAULT_LOCATION_SUGGESTIONS } from '../../utils/projectDetailsFormatters'

const LocationInput = memo(function LocationInput({
  id = 'project-location',
  name = 'location',
  value = '',
  onChange,
  placeholder = 'e.g. Mumbai, Pune or Remote',
  required = false,
  disabled = false,
  className = '',
  suggestions = DEFAULT_LOCATION_SUGGESTIONS,
  ariaDescribedBy,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const listboxRef = useRef(null)

  // Determine current active query for suggestions (handling multiple comma-separated locations)
  const { prefix, currentQuery } = useMemo(() => {
    const val = typeof value === 'string' ? value : ''
    const lastCommaIndex = val.lastIndexOf(',')
    if (lastCommaIndex !== -1) {
      return {
        prefix: val.slice(0, lastCommaIndex + 1),
        currentQuery: val.slice(lastCommaIndex + 1).trim(),
      }
    }
    return {
      prefix: '',
      currentQuery: val.trim(),
    }
  }, [value])

  // Filter suggestions based on current segment
  const filteredSuggestions = useMemo(() => {
    const rawVal = typeof value === 'string' ? value : ''
    const existingLocations = rawVal
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)

    const q = currentQuery.toLowerCase()
    return suggestions.filter((s) => {
      const sLower = s.toLowerCase()
      // Skip if this exact city is already in another comma-separated segment
      if (existingLocations.includes(sLower) && sLower !== q) {
        return false
      }
      if (!q) return true
      return sLower.includes(q)
    })
  }, [currentQuery, suggestions, value])

  // Click outside listener to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (activeIndex >= 0 && listboxRef.current) {
      const activeEl = listboxRef.current.children[activeIndex]
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex])

  const triggerChange = (newValue) => {
    if (typeof onChange === 'function') {
      const syntheticEvent = {
        target: { name, value: newValue },
        currentTarget: { name, value: newValue },
      }
      onChange(syntheticEvent)
    }
  }

  const handleInputChange = (e) => {
    triggerChange(e.target.value)
    setIsOpen(true)
    setActiveIndex(-1)
  }

  const handleSelectSuggestion = (selectedCity) => {
    let nextValue = selectedCity
    if (prefix) {
      const cleanPrefix = prefix.trimEnd()
      nextValue = `${cleanPrefix} ${selectedCity}`
    }
    triggerChange(nextValue)
    setIsOpen(false)
    setActiveIndex(-1)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        setIsOpen(true)
        setActiveIndex(0)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (filteredSuggestions.length > 0) {
        setActiveIndex((prev) => (prev + 1) % filteredSuggestions.length)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (filteredSuggestions.length > 0) {
        setActiveIndex((prev) => (prev <= 0 ? filteredSuggestions.length - 1 : prev - 1))
      }
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
        e.preventDefault()
        handleSelectSuggestion(filteredSuggestions[activeIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
      setActiveIndex(-1)
    } else if (e.key === 'Tab') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  const handleClear = () => {
    triggerChange('')
    setIsOpen(false)
    setActiveIndex(-1)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const defaultClasses =
    'w-full px-4 py-3 bg-[#0C0C11] border border-white/[0.11] rounded-xl text-sm text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-purple focus:ring-1 focus:ring-purple/20 focus:shadow-[0_0_15px_rgba(98,57,191,0.12)] pr-10'

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true)
            setActiveIndex(-1)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${id}-suggestions`}
          aria-describedby={ariaDescribedBy}
          className={className || defaultClasses}
        />

        {/* Clear or Dropdown Chevron indicator */}
        <div className="absolute right-3 flex items-center gap-1 pointer-events-auto">
          {value && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear location"
              className="p-1 text-white/30 hover:text-white transition-colors cursor-pointer rounded-full"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                if (!disabled) {
                  setIsOpen((prev) => !prev)
                  if (!isOpen && inputRef.current) {
                    inputRef.current.focus()
                  }
                }
              }}
              aria-label="Toggle location suggestions"
              className="p-1 text-white/30 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && !disabled && (
        <div
          id={`${id}-suggestions`}
          ref={listboxRef}
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto bg-[#111118] border border-white/10 rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl p-1.5 space-y-0.5 animate-fade-in"
        >
          {filteredSuggestions.length > 0 ? (
            <>
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                Suggestions
              </div>
              {filteredSuggestions.map((item, idx) => {
                const isSelected = activeIndex === idx
                return (
                  <div
                    key={item}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectSuggestion(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-['DM_Sans',_sans-serif] flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-purple/20 text-white font-medium'
                        : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-light' : 'text-white/30'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                      <span>{item}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] text-purple-light uppercase tracking-wider font-semibold">
                        Select
                      </span>
                    )}
                  </div>
                )
              })}
            </>
          ) : (
            <div className="px-3 py-3 text-center">
              <p className="text-xs text-white/50">
                No preset matches for &quot;{currentQuery}&quot;
              </p>
              <p className="text-[11px] text-purple-light/80 mt-1">
                Custom location will be saved as typed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export default LocationInput
