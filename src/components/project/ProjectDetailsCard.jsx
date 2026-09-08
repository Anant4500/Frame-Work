import { formatShootDates, formatBudgetRange } from '../../utils/projectDetailsFormatters'

export default function ProjectDetailsCard({ project }) {
  const formattedShootDates = formatShootDates(project?.shoot_start_date, project?.shoot_end_date)
  const formattedBudgetRange = formatBudgetRange(project?.budget_min, project?.budget_max, project?.budget)

  return (
    <div className="rounded-[18px] bg-[#111111] border border-white/[0.08] overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/[0.08]">
        <svg
          className="w-4 h-4 text-white/40 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        <h3 className="font-['DM_Sans',_sans-serif] text-xs font-semibold uppercase tracking-[0.14em] text-[#FFFFFF]">
          PROJECT DETAILS
        </h3>
      </div>

      {/* Field Rows */}
      <div className="divide-y divide-white/[0.06]">
        {/* 1. FORMAT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-3.5 px-6 min-h-[58px]">
          <span className="font-['DM_Sans',_sans-serif] text-[12px] font-normal uppercase text-white/40 leading-snug break-words">
            FORMAT
          </span>
          <div className="font-['DM_Sans',_sans-serif] text-sm sm:text-base text-white/90 sm:text-right min-w-0">
            {project?.format ? (
              <span className="font-semibold text-white">{project.format}</span>
            ) : null}
          </div>
        </div>

        {/* 2. SHOOT DATES */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-3.5 px-6 min-h-[58px]">
          <span className="font-['DM_Sans',_sans-serif] text-[12px] font-normal uppercase text-white/40 leading-snug break-words">
            SHOOT DATES
          </span>
          <div className="font-['DM_Sans',_sans-serif] text-sm sm:text-base text-white/90 sm:text-right min-w-0">
            {formattedShootDates ? (
              <span className="font-medium text-white">{formattedShootDates}</span>
            ) : null}
          </div>
        </div>

        {/* 3. LOCATIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-3.5 px-6 min-h-[58px]">
          <span className="font-['DM_Sans',_sans-serif] text-[12px] font-normal uppercase text-white/40 leading-snug break-words">
            LOCATIONS
          </span>
          <div className="font-['DM_Sans',_sans-serif] text-sm sm:text-base text-white/90 sm:text-right min-w-0">
            {project?.location ? (
              <span className="font-medium text-white">{project.location}</span>
            ) : null}
          </div>
        </div>

        {/* 4. LANGUAGE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-3.5 px-6 min-h-[58px]">
          <span className="font-['DM_Sans',_sans-serif] text-[12px] font-normal uppercase text-white/40 leading-snug break-words">
            LANGUAGE
          </span>
          <div className="font-['DM_Sans',_sans-serif] text-sm sm:text-base text-white/90 sm:text-right min-w-0">
            {project?.language ? (
              <span className="font-semibold text-white">{project.language}</span>
            ) : null}
          </div>
        </div>

        {/* 5. BUDGET RANGE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-3.5 px-6 min-h-[58px]">
          <span className="font-['DM_Sans',_sans-serif] text-[12px] font-normal uppercase text-white/40 leading-snug break-words">
            BUDGET RANGE
          </span>
          <div className="font-['DM_Sans',_sans-serif] text-sm sm:text-base text-white/90 sm:text-right min-w-0">
            {formattedBudgetRange ? (
              <span className="font-bold text-white">{formattedBudgetRange}</span>
            ) : null}
          </div>
        </div>

        {/* 6. TARGET */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-3.5 px-6 min-h-[58px]">
          <span className="font-['DM_Sans',_sans-serif] text-[12px] font-normal uppercase text-white/40 leading-snug break-words">
            TARGET
          </span>
          <div className="font-['DM_Sans',_sans-serif] text-sm sm:text-base text-white/90 sm:text-right min-w-0">
            {project?.target ? (
              <span className="font-semibold text-white">{project.target}</span>
            ) : null}
          </div>
        </div>

        {/* 7. TAGS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-3.5 px-6 min-h-[58px]">
          <span className="font-['DM_Sans',_sans-serif] text-[12px] font-normal uppercase text-white/40 leading-snug break-words">
            TAGS
          </span>
          <div className="font-['DM_Sans',_sans-serif] text-sm text-white/90 sm:text-right min-w-0">
            {Array.isArray(project?.tags) && project.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 sm:justify-end">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#181818] border border-white/10 rounded-full text-xs text-white/70 font-['DM_Sans',_sans-serif] font-normal"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
