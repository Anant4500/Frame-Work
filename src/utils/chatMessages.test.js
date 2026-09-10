import test from 'node:test'
import assert from 'node:assert/strict'
import { parseChatProjectId, mergeChatMessages, chatCursorFilter, formatChatMember, fetchChatAfter } from './chatMessages.js'

const row = (id, created_at = '2026-09-09T10:00:00.123456+00:00') => ({ id, created_at })

test('bigint chat IDs remain exact and invalid routes are rejected', () => {
  assert.equal(parseChatProjectId('9007199254740993'), '9007199254740993')
  assert.equal(parseChatProjectId('9223372036854775807'), '9223372036854775807')
  for (const id of ['9223372036854775808', '0', '-1', '1.5', '1e3', '01', ' 1', 'Infinity', 'nope', undefined]) {
    assert.equal(parseChatProjectId(id), null)
  }
})

test('history, send confirmation, and Broadcast overlap produce one ordered row per ID', () => {
  const result = mergeChatMessages([row('c'), row('b')], [row('a'), row('b'), row('a')])
  assert.deepEqual(result.map(r => r.id), ['a', 'b', 'c'])
})

test('sorting preserves microseconds before applying the UUID tie-breaker', () => {
  const result = mergeChatMessages([], [row('a', '2026-09-09T10:00:00.123457Z'), row('z')])
  assert.deepEqual(result.map(r => r.id), ['z', 'a'])
})

test('equivalent timestamp offsets sort by ID', () => {
  const result = mergeChatMessages([], [row('z'), row('a', '2026-09-09T15:30:00.123456+05:30')])
  assert.deepEqual(result.map(r => r.id), ['a', 'z'])
})

test('both cursor directions retain full timestamp precision and ID tie-breaker', () => {
  const cursor = row('b')
  for (const [direction, op] of [['older', 'lt'], ['newer', 'gt']]) {
    assert.equal(chatCursorFilter(cursor, direction), `created_at.${op}.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.${op}.b)`)
  }
})

test('roster mapping matches the SQL RPC contract and keeps multiple roles', () => {
  assert.deepEqual(formatChatMember({ id: 'owner', name: 'Owner', avatar: '/owner.png', is_creator: true, roles: ['Creator', 'Editor'] }), {
    id: 'owner', name: 'Owner', avatar: '/owner.png', isCreator: true, is_creator: true, roles: ['Creator', 'Editor'],
  })
  assert.equal(formatChatMember({ id: 'crew' }).name, 'Crew Member')
  assert.deepEqual(formatChatMember({ id: 'owner', is_creator: true, roles: [] }).roles, ['Project Owner'])
})

test('recovery traverses more than one server page, including short capped pages', async () => {
  const all = Array.from({ length: 123 }, (_, i) => row(String(i).padStart(3, '0')))
  let calls = 0
  const recovered = await fetchChatAfter(async cursor => {
    calls++
    return { data: all.filter(r => !cursor || r.id > cursor.id).slice(0, 17) }
  }, null)
  assert.deepEqual(recovered, all)
  assert.equal(calls, 9)
})

test('empty room recovery loads the first message', async () => {
  const recovered = await fetchChatAfter(async cursor => ({ data: cursor ? [] : [row('a')] }), null)
  assert.deepEqual(recovered, [row('a')])
})

test('failed recovery does not return a partial page set for merging', async () => {
  await assert.rejects(fetchChatAfter(async cursor => cursor ? { error: new Error('offline') } : { data: [row('a')] }, null), /offline/)
})

test('a closed room discards pending recovery results', async () => {
  let active = true
  const result = await fetchChatAfter(async () => {
    active = false
    return { data: [row('a')] }
  }, null, () => active)
  assert.deepEqual(result, [])
})
