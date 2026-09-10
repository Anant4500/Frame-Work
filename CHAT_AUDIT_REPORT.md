# FrameWork post-chat audit — 2026-09-09

This is a source audit and targeted fix report, not certification of the deployed database or a claim that the application is bug-free.

## Confirmed defects and fixes

| File / function | Root cause | Fix |
| --- | --- | --- |
| `src/pages/TeamChatPage.jsx`, roster mapping; `src/utils/chatMessages.js`, `formatChatMember` | The checked-in RPC returns `id`, `avatar`, `roles`; the page read `user_id`, `profile_photo_url`, `project_roles`. Member keys, avatars, roles, and role search were incorrect. | Map the actual SQL return contract, retain owner flags and multiple roles, provide missing-field fallbacks. SQL already groups members by UUID. |
| `TeamChatPage`, history/Broadcast/reconnect effects | Independent initial history could overwrite arrivals. Subscription reconciliation returned immediately for an empty room and could run before history completed. It made only one uncapped request, so server row limits could truncate recovery. | Serialize history and recovery, run another sync after subscription, coalesce concurrent sync requests, page until an empty result, and recover empty rooms. |
| `TeamChatPage`, all message merges | Append-only delivery order was treated as database order; the newest arrival could advance the recovery cursor past missing messages. | Deduplicate and sort by `(created_at, id)`, preserving PostgreSQL microseconds. Recovery starts from a stable initial history boundary, independent of notification/send arrivals. ID notifications also fetch that exact row with a project filter. |
| `TeamChatPage`, room lifecycle | Route changes reused old project, authorization, messages, and composer state. Broadcast, send, and pagination callbacks lacked cleanup guards. `Number(id)` also accepted fractional/exponential IDs and rounded large bigint IDs. | Key room state by route and account; deactivate every old room on cleanup; guard async results and mutations; parse positive decimal bigint IDs without Number conversion. |
| `TeamChatPage`, errors and membership | Failed history/member queries could appear empty. Failed initial authorization looked like definite denial. Quiet connected rooms never revalidated membership. | Show retryable access/load errors; retry on focus, online, and a 30-second interval; clear visible data and remove the local channel only after a successful negative membership result. Transient errors do not revoke membership. |
| `src/components/chat/ChatComposer.jsx`, `handleSend` | React state alone left a same-tick duplicate-send window. An undefined callback result cleared the draft; Enter during IME composition submitted prematurely. | Add synchronous send locks in composer and room; require explicit success; preserve a changed draft; ignore composing Enter. Persistence errors retain text. |
| `src/components/chat/ChatMessageList.jsx`, scrolling | Batched prepend/loading updates could scroll to the bottom while loading older messages. | Preserve scroll position when only older rows are prepended; distinguish newer arrivals; suppress the empty state on a load error. Viewport behavior still needs manual verification. |
| `src/pages/MyProjectsPage.jsx`, `fetchCollaboratorData`, Joined tab | Creators never fetched their own applications and the Joined tab was hard-coded empty. The project-ID fallback referenced an unselected column. | Fetch own applications for either account role, reuse the existing real Joined component, separate its loading state, and select `project_id`. |
| `src/components/project/EditProjectModal.jsx`, project update | A filtered UPDATE affecting zero rows returned no error and was treated as success before old poster/script cleanup. | Require `.select('id').single()` before cleanup or subsequent role operations. |
| `src/pages/ProjectDetailPage.jsx`, route lifecycle | Uncancelled requests from another project/account could write into reused detail state. | Key detail content by project and account, isolating pending responses in the old component. |
| `src/components/project/CollaboratorProjectView.jsx`, `myApplication` | A display-name fallback could select a different person's application status. | Match authenticated UUID only. This was a UI identity bug; it did not itself bypass database RLS. |

## Authorization and privacy findings

The following are conclusions from the checked-in SQL, conditional on the deployed schema matching it and no other permissive policies overriding the intended restrictions:

| Caller / operation | Local SQL behavior |
| --- | --- |
| Actual owner | Allowed by matching `projects.creator_id` to `auth.uid()`. |
| Currently accepted applicant, including a CREATOR account on someone else's project | Allowed; membership does not depend on profile role or project status. |
| Pending, rejected, withdrawn, unrelated user | Denied unless independently the owner or accepted through another application. |
| Logged-out caller | Membership helper returns false; message policies target authenticated callers. Chat redirects to login with a return path. |
| Cross-project SELECT/INSERT | Membership is evaluated against each row's project. All frontend message queries additionally filter the current project. |
| Sender spoofing | INSERT requires `sender_id = auth.uid()`. |
| UPDATE/DELETE | No enabling policies appear in these migrations. Authenticated grants explicitly list SELECT and INSERT. Effective deployed/default grants and other policies still require inspection. |
| Private Broadcast receiving | SELECT policy checks the Broadcast extension and membership for the parsed topic. |
| Client Broadcast sending | These migrations add no INSERT policy on `realtime.messages`; live overlapping policies must be checked before claiming deployed sending is denied. |

The chat table declares UUID message/sender IDs, bigint project IDs and helper parameters, project/profile foreign keys, a trimmed 1–2000-character body constraint, and the `(project_id, created_at DESC, id DESC)` index. Topic parsing catches invalid bigint casts. Noncanonical representations such as a leading zero can parse to the same project; this does not grant access to a different project, and the UI now produces canonical decimal topics.

The roster RPC checks caller membership, returns only UUID/name/avatar/owner/role fields, and aggregates distinct roles per member. Its profile joins are inner joins; actual foreign keys/profile visibility need live verification before asserting behavior for missing profile records. The client safely handles missing display fields. No applications, resume links, scripts, message bodies, or sender fields were added to Broadcast payloads.

Both checked-in trigger definitions broadcast only message ID and project ID with `private = true`. Bodies and sender display fields are fetched through the RLS-protected message query. Plain React text rendering is retained. No active mock messages, fake presence, typing, or reaction data were found; the unreferenced mock module contains only empty arrays/null. Existing disabled toolbar labels were retained.

Function execution grants in the local migrations do not explicitly revoke PostgreSQL's default PUBLIC execution privilege. The exposed membership/roster functions still gate access with `auth.uid()` and membership. Actual function ACLs, table grants, function ownership, and additional policies were not available to inspect.

Already-connected sockets are **not proven immediately revoked**. Supabase documents cached channel permissions: https://supabase.com/docs/guides/realtime/authorization. A stale socket may continue receiving ID notifications; subsequent Postgres queries remain the content-access boundary. The new local revalidation clears the room after a successful denial, subject to network availability and browser timer throttling. Data already delivered cannot be recalled.

## Migration and database limitations

No SQL or migration files changed. No migration was applied, and no production data was changed for testing.

Git first records both chat migrations together in `93bf983`. Both currently contain the minimal trigger. This demonstrates a redundant replacement in the local chain, but does not prove when an applied migration was edited. The original applied contents and migration ledger are unavailable, so restoring a speculative historical version would be unsafe. Preserve the files; compare with deployment artifacts before deciding whether a forward correction is needed.

There is no complete base schema in this repository, no available Supabase/database connector, and no `supabase` or `psql` executable. Therefore the actual project/applicant column types, base application/storage RLS, acceptance/rejection RPCs, complete grants, and deployment ledger were not verified. No administrative endpoint or service-role frontend credential was introduced.

The general scan covered auth hydration/guards, project create/edit/status persistence, Explore status/location filtering, role occupancy, acceptance/rejection callers, script URL handling, and accepted-team display. The acceptance RPC implementations and base RLS are outside the checked-in migration set; their atomicity/privacy cannot be established from frontend calls. Multi-request edits can partially persist if a later role operation fails; no broad transactional redesign was attempted.

## Tests actually run

- `node --test src/utils/chatMessages.test.js`: **10 passed, 0 failed**. Covers bigint IDs, duplicate/overlapping arrivals, microseconds, timestamp offsets, both cursor directions, SQL roster mapping, recovery beyond one server page, short server caps, empty-room recovery, failed pagination, and cancelled recovery.
- `npm run lint`: **passed**, no errors or warnings.
- `npm run build`: **passed**; Vite warns about a JS bundle larger than 500 kB (about 1.17 MB before gzip). No bundle redesign was part of this audit.
- `git diff --check`: passed. Git reports the existing LF-to-CRLF checkout conversion warning.
- No pre-existing unit/integration test suite or test script was found. No live database tests, browser automation, Playwright, E2E tests, or screenshots were run.

The helper tests do not exercise React effects, actual Supabase transport, SQL policies, or rendered scrolling. Those remain manual checks below.

## Exact manual verification steps

Use a disposable/local or staging dataset and test accounts; do not change production applications or messages just for these checks.

1. Prepare project A with an owner, an accepted collaborator, a CREATOR account accepted into A, pending/rejected/withdrawn applicants, and an unrelated user. Give the unrelated user membership in project B. Open `/project/<A>/team-chat` directly under each account. Only A's owner and currently accepted users should enter. Logged-out access should lead to login and return to the same chat after signing in.
2. For both accepted account roles, open My Projects → Joined → Chat and verify A's URL/title. Open Chat from the owner's project card and detail header. Test Back after normal navigation and after opening the chat URL in a fresh tab. Repeat accepted-team access with A In Production, Completed, and Closed.
3. In staging, give one accepted user two role applications. Check that the chat roster has one entry with both roles, correct owner flags, avatar fallback, search matches, and header count. Check Project Detail with two users sharing a display name: only the signed-in UUID's application should control their application status.
4. With two team members connected, send plain text containing `<script>alert(1)</script>`; it must display as text. Rapidly press Enter/click Send; verify one insert. Test IME Enter. Block the insert request, submit, and verify the draft remains with an error. For a response lost after commit, check the conversation before manually retrying; client-side locks do not provide cross-request exactly-once delivery.
5. Throttle requests, start A loading, then navigate to B. Repeat while sending or loading older messages. A's results/title/draft must never appear in B. Repeat between Project Detail routes and across accounts.
6. Create staging history with equal timestamps and enough rows to exceed the server response cap. Load older pages and verify no missing/duplicated IDs and a stable viewport. Send while initial history/subscription is opening. Disconnect an initially empty room, send its first messages elsewhere, reconnect, and verify recovery. Repeat with more missed messages than one server page and out-of-order deliveries.
7. Fail membership/history/roster queries temporarily. Confirm visible retry errors rather than false denial/empty-room claims; restore connectivity and use Retry/focus to recover. A periodic sync replays the initial loaded window, so measure query cost in long sessions. Very old/backdated inserts whose notifications were missed and which predate that initial boundary require reloading history; arbitrary historical replay is not guaranteed.
8. Revoke an accepted staging user's last accepted application while their chat stays open. On their next successful membership check, the UI should clear messages/members and leave its channel. Independently attempt Postgres SELECT/INSERT with their authenticated client; content access must fail. Inspect the stale socket payload and verify it contains only IDs. Do not interpret continued notifications as proof of continued content access or expect an immediate server socket disconnect.
9. Inspect the live schema in a read-only SQL session: `information_schema.columns`, `pg_constraint`, `pg_indexes`, `pg_policies` for `project_chat_messages` and `realtime.messages`; `pg_get_functiondef`/`proacl` for the three chat helpers and trigger; effective authenticated/anon privileges; and `supabase_migrations.schema_migrations`. Compare types, foreign keys, constraints, grants, default PUBLIC execution, trigger body, topic policy, and ledger against both local migrations. Also inspect base application/profile/storage policies and acceptance/rejection RPCs. Do not blindly reapply SQL.
10. Using staging authenticated clients, attempt cross-project reads/inserts, a spoofed `sender_id`, UPDATE, DELETE, and client Broadcast on A with both authorized and unauthorized accounts. Message mutation/spoofing and client Broadcast sends should not succeed. Verify no broader permissive policies exist. In a disposable project, make an edit target disappear before saving and verify the failed update does not continue into old-file cleanup or role changes. Smoke-test create/edit/status, capacity acceptance/rejection, and Explore filters.

## Files and Git safety

Modified: `src/pages/TeamChatPage.jsx`, `src/pages/MyProjectsPage.jsx`, `src/pages/ProjectDetailPage.jsx`, `src/components/chat/ChatComposer.jsx`, `src/components/chat/ChatMessageList.jsx`, `src/components/project/EditProjectModal.jsx`, `src/components/project/CollaboratorProjectView.jsx`.

Added: `src/utils/chatMessages.js`, `src/utils/chatMessages.test.js`, `CHAT_AUDIT_REPORT.md`. Build regenerated ignored `dist` output. No dependencies were added.

Initial `git status --short` was clean. Graphify's existing report was read first; its recorded commit `77ff5523` predates current `93bf983`, so source was authoritative. No git add, commit, push, reset, restore, clean, or checkout was run. No unexpected external edits were observed, and no pre-existing uncommitted/untracked work was removed.
