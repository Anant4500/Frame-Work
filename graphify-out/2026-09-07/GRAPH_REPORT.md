# Graph Report - framework-homepage  (2026-09-07)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 220 nodes · 378 edges · 17 communities (14 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `77ff5523`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ExploreProjects.jsx
- App.jsx
- devDependencies
- MyProjectsPage.jsx
- package.json
- supabaseClient.js
- ProjectDetailPage.jsx
- HomePage.jsx
- Hero.jsx
- AuthContext.jsx
- CollaboratorRegistrationForm.jsx
- FrameWork Platform
- Asset: favicon.svg
- Asset: auth-bg.png
- Asset: hero-bg.png

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 29 edges
2. `supabase` - 14 edges
3. `getRoleOccupancy()` - 9 edges
4. `ExploreProjects()` - 6 edges
5. `Header()` - 6 edges
6. `NotificationsPage()` - 6 edges
7. `getRoleCategory()` - 5 edges
8. `formatNotificationTime()` - 5 edges
9. `getNotificationDestination()` - 5 edges
10. `getNotificationTitle()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `HTML Root Entry` --references--> `FrameWork Platform`  [INFERRED]
  index.html → README.md
- `ExploreProjects()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/ExploreProjects.jsx → src/context/useAuth.js
- `AppContent()` --calls--> `useAuth()`  [EXTRACTED]
  src/App.jsx → src/context/useAuth.js
- `Header()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/Header.jsx → src/context/useAuth.js
- `Hero()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/Hero.jsx → src/context/useAuth.js

## Import Cycles
- None detected.

## Communities (17 total, 3 thin omitted)

### Community 0 - "ExploreProjects.jsx"
Cohesion: 0.09
Nodes (23): RoleCategoryImage(), RolePickerModal(), cn(), InteractiveHoverButton, ALIAS_CATEGORY_SETS, ALIAS_TO_CANONICAL_ROLES, CANONICAL_NAME_TO_ROLE, CANONICAL_ROLE_ALIASES (+15 more)

### Community 1 - "App.jsx"
Cohesion: 0.12
Nodes (19): App(), AppContent(), CallToAction(), Footer(), ALL_CREATOR_DISCIPLINES, CreatorRegistrationForm(), POPULAR_DISCIPLINES, REMAINING_DISCIPLINES (+11 more)

### Community 2 - "devDependencies"
Cohesion: 0.09
Nodes (23): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+15 more)

### Community 3 - "MyProjectsPage.jsx"
Cohesion: 0.10
Nodes (5): CollaboratorApplicationCard(), CreatorProjectCard(), JoinedProductionCard(), APP_STATUS, STATUS_STYLES

### Community 4 - "package.json"
Cohesion: 0.10
Nodes (20): motion, dependencies, motion, react, react-dom, react-router-dom, @supabase/supabase-js, name (+12 more)

### Community 5 - "supabaseClient.js"
Cohesion: 0.19
Nodes (9): Header(), ApplicantCard(), supabase, NotificationsPage(), AVAILABILITY_OPTIONS, EXPERIENCE_OPTIONS, formatNotificationTime(), getNotificationDestination() (+1 more)

### Community 6 - "ProjectDetailPage.jsx"
Cohesion: 0.28
Nodes (10): ApplyModal(), CollaboratorProjectView(), CreatorProjectView(), VALID_TABS, clampToMaxNonWhitespace(), EditProjectModal(), extractPosterStoragePath(), getRoleOccupancy() (+2 more)

### Community 7 - "HomePage.jsx"
Cohesion: 0.20
Nodes (10): FeaturedCreators(), FeaturedProjects(), flowchartSteps, HowItWorks(), CarouselCard(), FeaturedProjectsCarousel(), formatRoles(), getDims() (+2 more)

### Community 8 - "Hero.jsx"
Cohesion: 0.26
Nodes (9): Hero(), HeroJourney(), quick(), ROLES, stagger(), STEPS, useReducedMotion(), cn() (+1 more)

### Community 9 - "AuthContext.jsx"
Cohesion: 0.33
Nodes (8): AuthContext, AuthProvider(), DB_ROLE_TO_FRONTEND, fetchUserProfile(), FRONTEND_ROLE_TO_DB, insertUserSkills(), mapRoleToDb(), mapRoleToFrontend()

### Community 10 - "CollaboratorRegistrationForm.jsx"
Cohesion: 0.25
Nodes (7): ALL_COLLABORATOR_SKILLS, AVAILABILITY_OPTIONS, COLLABORATOR_DEPARTMENTS, COLLABORATOR_SKILL_GROUPS, CollaboratorRegistrationForm(), EXPERIENCE_LEVELS, POPULAR_COLLABORATOR_SKILLS

### Community 11 - "FrameWork Platform"
Cohesion: 0.50
Nodes (4): HTML Root Entry, Filmmaking Collaboration Workflow, Filmmaker & Crew Roles, FrameWork Platform

## Knowledge Gaps
- **61 isolated node(s):** `Filmmaking Collaboration Workflow`, `Filmmaker & Crew Roles`, `HTML Root Entry`, `ALIAS_CATEGORY_SETS`, `ALIAS_TO_CANONICAL_ROLES` (+56 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `App.jsx` to `ExploreProjects.jsx`, `MyProjectsPage.jsx`, `supabaseClient.js`, `ProjectDetailPage.jsx`, `HomePage.jsx`, `Hero.jsx`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Why does `supabase` connect `supabaseClient.js` to `ExploreProjects.jsx`, `App.jsx`, `MyProjectsPage.jsx`, `ProjectDetailPage.jsx`, `HomePage.jsx`, `AuthContext.jsx`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `Filmmaking Collaboration Workflow`, `Filmmaker & Crew Roles`, `HTML Root Entry` to the rest of the system?**
  _61 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExploreProjects.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0928030303030303 - nodes in this community are weakly interconnected._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11693548387096774 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._