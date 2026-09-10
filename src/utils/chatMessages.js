export const CHAT_PAGE_SIZE = 50
export const CHAT_MESSAGE_SELECT = 'id, project_id, sender_id, body, created_at, sender:profiles!sender_id(id, name, profile_photo_url, role)'

// Keep bigint route IDs as decimal strings; Number can silently round them.
export function parseChatProjectId(value) {
  if (!/^[1-9]\d*$/.test(value || '')) return null
  return BigInt(value) <= 9223372036854775807n ? value : null
}

function timestampKey(value) {
  // Preserve Postgres microseconds, which Date alone truncates to milliseconds.
  const fraction = /\.(\d+)/.exec(value)?.[1] || ''
  return BigInt(Date.parse(value)) * 1000n + BigInt(fraction.padEnd(6, '0').slice(3, 6))
}

export function mergeChatMessages(current, incoming) {
  const rows = new Map(current.map((row) => [row.id, row]))
  for (const row of incoming) rows.set(row.id, row)
  return [...rows.values()].sort((a, b) => {
    const aTime = timestampKey(a.created_at)
    const bTime = timestampKey(b.created_at)
    return aTime < bTime ? -1 : aTime > bTime ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0
  })
}

export function chatCursorFilter(row, direction) {
  const op = direction === 'older' ? 'lt' : 'gt'
  return `created_at.${op}.${row.created_at},and(created_at.eq.${row.created_at},id.${op}.${row.id})`
}

export function formatChatMember(row) {
  return {
    id: row.id,
    name: row.name || (row.is_creator ? 'Project Owner' : 'Crew Member'),
    avatar: row.avatar || null,
    roles: row.roles?.length ? row.roles : [row.is_creator ? 'Project Owner' : 'Crew Member'],
    isCreator: Boolean(row.is_creator),
    is_creator: Boolean(row.is_creator),
  }
}

// Continue until an empty page: a server's row limit may be lower than our limit.
export async function fetchChatAfter(fetchPage, cursor, isActive = () => true) {
  const rows = []
  while (isActive()) {
    const { data, error } = await fetchPage(cursor)
    if (!isActive()) return []
    if (error) throw error
    if (!data?.length) break
    rows.push(...data)
    cursor = data[data.length - 1]
  }
  return rows
}
