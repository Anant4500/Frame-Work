# Graph Report - framework-homepage  (2026-08-28)

## Corpus Check
- Large corpus: 54 files · ~602,671 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 180 nodes · 224 edges · 34 communities (11 shown, 23 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App Routing & Layout
- ESLint Tooling & Plugins
- Core Dependencies & Packages
- Dashboard & User Project State
- Landing Showcase & Featured Content
- Authentication & Role Management
- Project Discovery & Filtering
- Platform Architecture & Documentation
- Creator Profile Data Model
- Branding: Favicon Asset
- Branding: UI Icons SVG
- Asset: Auth Background
- Asset: Default Avatar
- Asset: Creator Profile 1
- Asset: Creator Profile 2
- Asset: Creator Profile 3
- Asset: Creator Profile 4
- Asset: Echoes Poster
- Asset: Fragments Poster
- Asset: Hero Background
- Asset: Project Poster 1
- Asset: Project Poster 2
- Asset: Project Poster 3
- Asset: Project Poster 4
- Asset: Project Poster 5
- Asset: Project Poster 6
- Asset: Project Poster 7
- Asset: Project Poster 8
- Asset: Project Poster 9
- Asset: The Last Frame Poster
- Asset: Unwritten Poster

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 21 edges
2. `supabase` - 8 edges
3. `scripts` - 5 edges
4. `AuthProvider()` - 5 edges
5. `MyProjectsPage()` - 4 edges
6. `CallToAction()` - 3 edges
7. `FeaturedProjects()` - 3 edges
8. `Header()` - 3 edges
9. `fetchUserProfile()` - 3 edges
10. `useProjects()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `HTML Root Entry` --references--> `FrameWork Platform`  [INFERRED]
  index.html → README.md
- `AppContent()` --calls--> `useAuth()`  [EXTRACTED]
  src/App.jsx → src/context/useAuth.js
- `MyProjectsPage()` --calls--> `getDashboardStats()`  [EXTRACTED]
  src/pages/MyProjectsPage.jsx → src/data/myProjectsData.js
- `CallToAction()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/CallToAction.jsx → src/context/useAuth.js
- `FeaturedProjects()` --calls--> `useProjects()`  [EXTRACTED]
  src/components/FeaturedProjects.jsx → src/context/useProjects.js

## Import Cycles
- None detected.

## Communities (34 total, 23 thin omitted)

### Community 0 - "App Routing & Layout"
Cohesion: 0.12
Nodes (16): App(), AppContent(), CallToAction(), Footer(), Header(), useAuth(), CreateProjectPage(), ExploreProjects() (+8 more)

### Community 1 - "ESLint Tooling & Plugins"
Cohesion: 0.09
Nodes (23): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+15 more)

### Community 3 - "Core Dependencies & Packages"
Cohesion: 0.11
Nodes (18): dependencies, react, react-dom, react-router-dom, @supabase/supabase-js, name, private, scripts (+10 more)

### Community 4 - "Dashboard & User Project State"
Cohesion: 0.12
Nodes (5): getDashboardStats(), joinedProjects, myApplications, APP_STATUS, STATUS_STYLES

### Community 5 - "Landing Showcase & Featured Content"
Cohesion: 0.17
Nodes (10): creators, FeaturedCreators(), FeaturedProjects(), Hero(), HowItWorks(), steps, ProjectsContext, ProjectsProvider() (+2 more)

### Community 6 - "Authentication & Role Management"
Cohesion: 0.17
Nodes (12): AuthContext, AuthProvider(), DB_ROLE_TO_FRONTEND, fetchUserProfile(), FRONTEND_ROLE_TO_DB, insertUserSkills(), mapRoleToDb(), mapRoleToFrontend() (+4 more)

### Community 7 - "Project Discovery & Filtering"
Cohesion: 0.33
Nodes (3): genres, locations, roles

### Community 8 - "Platform Architecture & Documentation"
Cohesion: 0.50
Nodes (4): HTML Root Entry, Filmmaking Collaboration Workflow, Filmmaker & Crew Roles, FrameWork Platform

## Knowledge Gaps
- **66 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+61 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `App Routing & Layout` to `User Profile & Collaborator Views`, `Dashboard & User Project State`, `Authentication & Role Management`, `Project Discovery & Filtering`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `ESLint Tooling & Plugins` to `Core Dependencies & Packages`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `supabase` connect `Authentication & Role Management` to `App Routing & Layout`, `User Profile & Collaborator Views`, `Dashboard & User Project State`, `Project Discovery & Filtering`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _66 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Routing & Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.12043010752688173 - nodes in this community are weakly interconnected._
- **Should `ESLint Tooling & Plugins` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `User Profile & Collaborator Views` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._