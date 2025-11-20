# Changelog

All notable changes to ClubManager will be documented in this file. Newest changes are at the top.

---

## 2025-11-18

### 🔐 Cocobase Authentication & Data Backend Integration

**Overview:**
- Integrated Cocobase JavaScript SDK as the primary backend for authentication and data.
- Switched email/password auth and Google login to use Cocobase sessions (`db.user`, `db.isAuthenticated()`).
- Prepared the app to move from mock/demo data to real collections.

**Auth & Session Changes:**
- Updated `src/context/AuthContext.tsx` to:
  - Use `db.register`, `db.login`, `db.logout`, and `db.isAuthenticated` instead of `db.auth.*`.
  - Store the authenticated Cocobase user in context from `db.user` after login/register/Google auth.
  - Add `loginWithGoogle(token)` helper that logs in with Google via Cocobase and syncs context state.
- Updated `src/pages/Login.tsx` and `src/pages/Register.tsx` to:
  - Use `useAuth()` for all auth flows (including Google) instead of calling `db.auth` directly.
  - Add console logging for Cocobase errors to aid debugging.
- Added `src/lib/cocobase.ts` debug logging to verify `VITE_COCOBASE_API_KEY` and `VITE_COCOBASE_PROJECT_ID` loading.

**Environment & Setup:**
- Confirmed Vite env variables for Cocobase:
  - `VITE_COCOBASE_API_KEY`
  - `VITE_COCOBASE_PROJECT_ID`
- Resolved 422 `x-api-key` errors by correctly wiring API key + project ID and restarting the dev server.

**Collections / Data Model:**
- Created a `members` collection in Cocobase (performed by: user).
- Planned `members` schema to include fields like `name`, `email`, `phone`, `role`, `status`, `joinedAt`, `avatar`, and `ownerId` (Cocobase user id), to support real member management.
- Wired `src/pages/Members.tsx` to the real `members` collection using Cocobase document APIs (`createDocument`, `listDocuments`, `deleteDocument`) and React Query.
- Each member document is stored with an `ownerId` equal to the authenticated Cocobase user ID (per-user workspace isolation).
- Decided to progressively migrate all mock data (Members, Events, Announcements, Files, Analytics) to real Cocobase collections.

**Files Modified:**
- `src/context/AuthContext.tsx`
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/lib/cocobase.ts`
- `src/pages/Members.tsx`
- `changelog.md`

---

## 2025-02-11 18:45:00

### ✨ Major Feature Release - Performance, Admin Dashboard, Enhanced UX

**New Features:**
- Features Page (/features) with comprehensive platform showcase
- Admin Dashboard (/admin) - exclusive admin-only access with system-wide analytics
- Autosave Drafts System (saves every 5 seconds to localStorage)
- Keyboard Shortcuts (Cmd/Ctrl+S save, Cmd/Ctrl+Enter publish)
- Color-Blind Friendly Mode (4 accessible palettes)
- Dark Mode Toggle with persistent preferences
- ThemeContext for global theme management
- Custom useDrafts hook for draft management

**Performance Optimizations:**
- Vite build config with manual code chunking (react-vendor, ui-vendor, chart-vendor)
- Enhanced lazy loading for all heavy pages
- Bundle size optimizations

**Navigation Updates:**
- Added Features and Admin links to Navbar
- Fixed Dashboard quick action cards with proper routing
- Mobile menu improvements

**Files Created:**
- src/pages/Features.tsx
- src/pages/AdminDashboard.tsx
- src/hooks/useDrafts.ts
- src/context/ThemeContext.tsx

**Files Modified:**
- vite.config.ts, src/App.tsx, src/pages/Dashboard.tsx, src/pages/Settings.tsx
- src/pages/Announcements.tsx, src/components/Navbar.tsx, README.md, changelog.md

---

## 2025-02-11

### ✨ Major Platform Enhancement - Production Ready

**New Public Pages Created:**
- **Pricing Page** (`src/pages/Pricing.tsx`)
  - Three pricing tiers (Free, Pro, Enterprise) with glassmorphic cards
  - Highlighted "Most Popular" plan with neon glow effects
  - Fully responsive pricing grid
  - Collapsible FAQ section with 6 common questions
  - CTA section for sales contact
  - Mobile-optimized card layout with proper text scaling

- **Roadmap Page** (`src/pages/Roadmap.tsx`)
  - Futuristic timeline layout with status indicators
  - Completed, In Progress, and Planned sections
  - Color-coded status badges (cyan, indigo, muted)
  - Feature lists for each roadmap item
  - "Suggest a Feature" CTA button
  - Expandable cards showing Q4 2024 through Q4 2025 releases

- **About Page** (`src/pages/About.tsx`)
  - Hero section with mission statement
  - Platform statistics grid (2,500+ communities, 150K+ members, etc.)
  - Core values section with icon cards
  - Team member showcase with avatars and social links
  - Fully responsive grid layouts

- **Blog Page** (`src/pages/Blog.tsx`)
  - Blog article feed with 6 sample posts
  - Category filtering (All, Community Building, Technology, etc.)
  - Search functionality for articles
  - Post metadata (author, date, read time)
  - Tag system for article categorization
  - Newsletter subscription CTA
  - Pagination support
  - Mobile-responsive card grid

- **Careers Page** (`src/pages/Careers.tsx`)
  - "Join Our Mission" hero section
  - Company perks/benefits grid (Health, Flexible Hours, Remote, Learning Budget)
  - 6 open position listings (Engineer, Designer, Success Manager, etc.)
  - Collapsible job listings with full details
  - Responsibilities and requirements for each role
  - Department and location badges
  - Mobile-optimized expandable cards

**Navigation Enhancements:**
- Updated `src/components/Navbar.tsx` with links to new public pages
  - Added Pricing, About, Blog links for non-authenticated users
  - Mobile menu now includes Careers link
  - Improved mobile hamburger menu with all new pages
  
- Updated `src/components/Footer.tsx` (already had links to new pages)

**Routing Updates:**
- Modified `src/App.tsx` to include all new public routes
  - Added `/pricing`, `/roadmap`, `/about`, `/blog`, `/careers` routes
  - Implemented React.lazy() for code splitting and performance
  - Created PageLoader component for Suspense fallback
  - Wrapped app in PrefsProvider for accessibility preferences

**Performance Optimizations:**
- Implemented lazy loading for heavy pages:
  - Dashboard, Members, Events, Announcements, Files, Analytics, Settings
  - Pricing, Roadmap, About, Blog, Careers
- Added Suspense boundaries with beautiful loading state
- Code splitting to reduce initial bundle size
- Optimized imports for faster page loads

**Mobile Responsiveness Improvements:**
- Updated `src/components/DashboardLayout.tsx`
  - Sidebar now hidden on mobile (md:block)
  - Main content area responsive padding (p-4 md:p-8)
  - Removed left margin on mobile (ml-0 md:ml-64)
  - Added overflow-x-hidden to prevent horizontal scroll

- Updated `src/components/Sidebar.tsx`
  - Hidden on mobile devices (hidden md:block)
  - Collapsible on desktop with toggle button
  - Smooth width transition (80px collapsed, 256px expanded)

- All new pages built mobile-first:
  - Responsive grids (grid-cols-1 md:grid-cols-2 lg:grid-cols-3/4)
  - Flexible text sizes (text-4xl md:text-6xl)
  - Touch-friendly buttons and interactive elements
  - Proper spacing on small screens

**Animation & Accessibility Enhancements:**
- Created `src/styles/animation-tokens.css`
  - Global animation duration and easing tokens
  - Respects prefers-reduced-motion media query
  - Reduces all animations to near-instant for accessibility
  - Utility classes for common transitions

- Created `src/context/PrefsContext.tsx`
  - Tracks user's reduced motion preference
  - Provides prefersReducedMotion boolean to all components
  - Listens for system preference changes
  - Enables accessible animation behavior

- Imported animation tokens in `src/index.css`
  - Available globally across all components

**Accessibility Improvements:**
- All new pages use semantic HTML (header, main, section, nav)
- ARIA labels on interactive elements (buttons, links)
- Proper heading hierarchy (h1 → h2 → h3)
- Keyboard navigation support with visible focus states
- Color contrast meeting WCAG standards
- Reduced motion support throughout
- Screen reader friendly structure

**Design System Consistency:**
- All pages follow glassmorphic design language
- Consistent use of neon-cyan and neon-indigo accents
- Smooth Framer Motion animations throughout
- Responsive typography scaling
- Proper spacing and visual hierarchy
- Dark theme with consistent color palette

**SEO Enhancements:**
- Descriptive page titles and meta descriptions ready
- Semantic HTML for better crawlability
- Proper heading structure
- Clean URL structure for all pages

**Documentation Updates:**
- Completely rewrote `README.md` for end users
  - Comprehensive feature descriptions
  - Detailed navigation guide
  - Accessibility and performance info
  - Browser compatibility section
  - User-focused language (not developer docs)
  - Expanded to cover all new pages

**Files Modified:**
- `src/App.tsx` - Added lazy loading, new routes, PrefsProvider
- `src/components/Navbar.tsx` - Added navigation links to new pages
- `src/components/DashboardLayout.tsx` - Mobile responsive improvements
- `src/components/Sidebar.tsx` - Hidden on mobile
- `src/index.css` - Imported animation tokens
- `README.md` - Complete rewrite for end users
- `changelog.md` - This entry (top-down format maintained)

**Files Created:**
- `src/pages/Pricing.tsx`
- `src/pages/Roadmap.tsx`
- `src/pages/About.tsx`
- `src/pages/Blog.tsx`
- `src/pages/Careers.tsx`
- `src/styles/animation-tokens.css`
- `src/context/PrefsContext.tsx`

**Technical Stack Enhanced:**
- React 18 with TypeScript
- React.lazy() and Suspense for code splitting
- Framer Motion for animations
- TailwindCSS with custom design system
- React Router v6 with lazy routes
- Collapsible components for interactive UI
- Context API for preferences management

**Key Improvements:**
- Zero horizontal scrolling on any device
- Sidebar adapts to screen size
- All content readable on mobile
- Touch-friendly interface
- Performant page loads with lazy loading
- Accessibility compliant
- Production-ready frontend

---

## 2025-02-10

### ✨ Initial Release - Complete Platform Launch

**Features Added:**
- Complete frontend application with all core features
- Futuristic glassmorphic UI design system
- Dark theme with cyan and indigo neon accents

**Pages Created:**
- Landing Page with hero section and feature showcase
- Login & Registration pages with beautiful glass card UI
- Dashboard with real-time stats and activity feed
- Members page with searchable table and add member modal
- Events page with card grid, RSVP functionality, and countdown timers
- Announcements page with infinite scroll feed and reactions
- Files page with drag-and-drop upload functionality
- Analytics page with interactive charts and insights
- Settings page with profile, notifications, and security options

**Components Built:**
- Navbar with responsive mobile menu
- Sidebar with collapsible navigation
- Footer with social links
- Feature cards with hover animations
- Authentication context for user management

**Design System:**
- Custom color palette with HSL values
- Glassmorphic card styles with backdrop blur
- Neon glow effects for interactive elements
- Smooth animations using Framer Motion
- Floating shapes and gradient backgrounds
- Responsive breakpoints for all screen sizes

**Technical Implementation:**
- React 18 with TypeScript
- Vite for fast development
- TailwindCSS for styling
- Framer Motion for animations
- React Router for navigation
- Recharts for data visualization
- React Dropzone for file uploads
- Shadcn UI components
- Context API for global state management

**Files Modified:**
- `src/index.css` - Design system tokens and utilities
- `tailwind.config.ts` - Extended theme configuration
- `index.html` - SEO meta tags and Inter font
- `src/App.tsx` - Complete routing setup
- `README.md` - User-friendly documentation

**Mock Data:**
- Sample members with avatars
- Demo events with images
- Example announcements
- Dummy file entries
- Analytics data for charts

---

## Notes

This changelog tracks all significant changes to the ClubManager platform. Each entry includes the date, description of changes, and affected files/features.

## 2025-11-18 20:15:00

### 📅 Events & 📣 Announcements wired to Cocobase

**Overview:**
- Connected Events and Announcements pages to real Cocobase collections using React Query.
- Removed mock/demo data for these pages so they now operate entirely on real backend documents, scoped per Cocobase user.

**Events (`events` collection):**
- Updated `src/pages/Events.tsx` to load events from Cocobase via `db.listDocuments('events', { filters: { ownerId }, sort: 'date', order: 'asc' })` with React Query.
- Create Event modal now persists new events to Cocobase with `db.createDocument('events', { title, description, date, time, location, maxAttendees, attendees, rsvp, image, ownerId })`.
- RSVP button now updates the corresponding document using `db.updateDocument('events', id, { rsvp, attendees })`, keeping attendee counts and RSVP state in sync with the backend.
- Existing UI (cards, filters for All / Upcoming / Past, countdown badge) is preserved while being backed by real data.

**Announcements (`announcements` collection):**
- Updated `src/pages/Announcements.tsx` to fetch announcements from Cocobase with `db.listDocuments('announcements', { filters: { ownerId }, sort: 'created_at', order: 'desc' })` using React Query.
- Posting a new announcement now calls `db.createDocument('announcements', { authorName, authorAvatar, authorRole, content, createdAt, likes, comments, isLiked, ownerId })` instead of only updating local state.
- Like/unlike actions now persist to Cocobase via `db.updateDocument('announcements', id, { isLiked, likes })`, so reactions are stored with the document.
- Preserved the existing UX: autosave drafts via `useDrafts`, keyboard shortcuts (Cmd/Ctrl+S to save draft, Cmd/Ctrl+Enter to publish), and the same glassmorphic feed layout.

**Per-user isolation:**
- Both `events` and `announcements` documents store an `ownerId` equal to the authenticated Cocobase `user.id`, ensuring each user sees only their own workspace data.

**Files Modified:**
- `src/pages/Events.tsx`
- `src/pages/Announcements.tsx`
- `changelog.md`

## 2025-11-18 20:30:00

### 📊 Dashboard stats connected to Cocobase

**Overview:**
- Replaced all mock dashboard stats and fake recent activity with real data from Cocobase collections.
- Ensured that when there is no data yet, the dashboard honestly shows `0` counts and a friendly empty-state message.

**Stats Cards:**
- `Total Members` now displays the count of documents in the `members` collection for the current `ownerId`.
- `Upcoming Events` shows the number of events in the `events` collection with a scheduled date/time in the future for the current `ownerId`.
- `Active Today` shows the number of new activities today based on members joined, events created, and announcements posted today.
- `Total Announcements` shows the count of documents in the `announcements` collection for the current `ownerId`.

**Recent Activity Feed:**
- Replaced hard-coded sample activity with a real feed composed from the latest:
  - Member who joined (`members` collection).
  - Event that was created (`events` collection).
  - Announcement that was posted (`announcements` collection).
- Each activity item now displays a relative time label like "Just now", "5 minutes ago", or "2 days ago" based on the Cocobase timestamps.
- Shows a clear "No recent activity yet" message when there are no members, events, or announcements.

**Per-user Isolation:**
- All dashboard stats and recent activity are filtered by `ownerId = user.id`, so each Cocobase user sees only their own community workspace data.

**Files Modified:**
- `src/pages/Dashboard.tsx`
- `changelog.md`

## 2025-11-18 21:00:00

### 👥 Workspace multi-user model & invite flow

**Overview:**
- Introduced a workspace-based multi-user model where the first registered account is the workspace owner.
- All invited users share the same `workspaceId` and see the same members, events, announcements, and dashboard stats.
- Added an invite-based onboarding flow using a Coco Mailer stub and a dedicated Accept Invite page.

**Workspace Model:**
- Defined `workspaceId` derivation:
  - For the owner: `workspaceId = user.id`.
  - For invited users: `workspaceId` stored in Cocobase user metadata during invite acceptance.
- Updated data access to be workspace-aware by using `workspaceId` (via `ownerId` field) in queries instead of the current user id.

**Members & Invites:**
- Extended `members` collection documents to include:
  - `workspaceId`, `authUserId`, `status` (`'invited' | 'active' | 'inactive'`), `inviteToken`, and `invitedAt`.
- Updated `src/pages/Members.tsx` to:
  - Use `workspaceId` for listing members: `db.listDocuments('members', { filters: { ownerId: workspaceId } })`.
  - Create invited members with `status: 'invited'` and a generated `inviteToken`.
  - Call a Coco Mailer stub (`sendInviteEmail`) to "send" an invite email containing a link to `/accept-invite/:token`.
  - Show a more accurate status, including `invited`, in the members table.

**Coco Mailer Stub:**
- Added `src/lib/cocomailer.ts` as a thin integration layer for future Coco Mailer wiring.
  - Exposes `sendInviteEmail({ to, name, role, inviteLink })`.
  - Currently logs the payload and shows a toast that an invite email was queued.
  - Ready to be replaced with real Coco Mailer API calls once configured.

**Accept Invite Flow:**
- Created `src/pages/AcceptInvite.tsx` with glassmorphic UI consistent with the rest of the app:
  - Loads the `members` document by `inviteToken`.
  - Shows the invited email, name, and role in a read-only card.
  - Prompts the user to set and confirm a password.
  - Calls `register(name, email, password, { role, workspaceId })` via `AuthContext` to create a Cocobase user tied to the workspace.
  - Updates the original member document with `status: 'active'`, `authUserId`, `joinedAt`, and clears `inviteToken`.
  - Redirects to `/dashboard` on success.
- Registered a public route in `src/App.tsx`:
  - `path="/accept-invite/:token"` → lazy-loaded `AcceptInvite` page.

**Workspace-aware Pages:**
- Updated pages to use `workspaceId = user.workspaceId ?? user.id` so invited users see the same workspace data as the owner:
  - `src/pages/Members.tsx` (members listing and creation)
  - `src/pages/Events.tsx` (events listing and creation)
  - `src/pages/Announcements.tsx` (announcements listing and creation)
  - `src/pages/Dashboard.tsx` (stats and recent activity aggregation)

**Files Created:**
- `src/lib/cocomailer.ts`
- `src/pages/AcceptInvite.tsx`

**Files Modified:**
- `src/context/AuthContext.tsx` (extended `register` to accept extra metadata)
- `src/pages/Members.tsx`
- `src/pages/Events.tsx`
- `src/pages/Announcements.tsx`
- `src/pages/Dashboard.tsx`
- `src/App.tsx`
- `changelog.md`

## 2025-11-18 21:15:00

### 📧 Coco Mailer wired via Cocobase Cloud Function

**Overview:**
- Replaced the local invite email stub with a real HTTP call to a Cocobase Cloud Function so that member invites trigger actual emails via Coco Mailer.

**Implementation Details:**
- Updated `src/lib/cocomailer.ts`:
  - Reads the function URL from `VITE_COCO_MAILER_INVITE_URL`.
  - Sends a `POST` request with JSON body `{ to, name, role, inviteLink }` when `sendInviteEmail` is called.
  - Shows success or error toasts depending on the HTTP response.
  - Falls back to logging + a "queued" toast if `VITE_COCO_MAILER_INVITE_URL` is not configured, so local development still works.

**Setup Required:**
- In Cocobase, create a Cloud Function that:
  - Receives the invite payload as JSON.
  - Uses the Coco Mailer integration (configured in the Integrations tab) to send the actual email.
- In the frontend `.env` (Vite):
  - Set `VITE_COCO_MAILER_INVITE_URL` to the HTTP URL of that Cloud Function.

**Files Modified:**
- `src/lib/cocomailer.ts`
- `changelog.md`

## 2025-11-19 05:49:00

### 🧩 Multi-user workspace invite flow completion, role-based access, Files, Analytics & Settings

**Overview:**
- Finalized the multi-user workspace model so that owners and invited members share the same workspace data via `workspaceId`.
- Completed the invite email flow using the Coco Mailer HTTP API with base64-encoded invite tokens.
- Implemented admin-only Files, Analytics, and Settings experiences, wired to real Cocobase data.

**Invite Email Flow (Coco Mailer HTTP API):**
- Updated `src/lib/cocomailer.ts` to send real emails through the Coco Mailer HTTP API instead of a Cocobase Cloud Function:
  - Uses `VITE_COCO_MAILER_CONFIG_KEY` to build the endpoint: `https://coco-mailer-api.vercel.app/api/send-mail/{configKey}`.
  - Sends a `POST` request with `{ to, subject, html }`, where `html` is a fully rendered invite email including the invite link.
  - Shows success and error toasts based on the HTTP response.
  - Logs and surfaces helpful error messages if the request fails.
- Simplified and hardened the send payload from the Members page to avoid backend 500 errors.

**Base64 Invite Token & Accept Invite Page:**
- Changed the invite link format so it no longer relies on storing a random `inviteToken` in the `members` document:
  - Members page now builds a JSON payload `{ email, name, role, workspaceId, issuedAt }`.
  - Encodes the payload as a URL-safe base64 string and appends it as `?payload=...` in the invite URL.
  - Uses `VITE_APP_BASE_URL` so invite links work in both local dev and Netlify production (e.g. `https://your-site.netlify.app/accept-invite?payload=...`).
- Updated `src/pages/AcceptInvite.tsx` to:
  - Read and URL-decode the `payload` query parameter.
  - Base64-decode and `JSON.parse` the invite payload, with error handling for malformed tokens.
  - Look up the corresponding member by `workspaceId` and `email` instead of an `inviteToken` field.
  - Register the new user via `register(name, email, password, { role, workspaceId })` using the extended `AuthContext` API.
  - Update the matching member document to `status: 'active'`, set `authUserId`, `joinedAt`, and clear any obsolete invite metadata.
  - Redirect to `/dashboard` on success and surface clear errors on failure.

**Auth & Workspace Metadata:**
- Extended `src/context/AuthContext.tsx` to allow `register` to accept arbitrary extra metadata that is stored on the Cocobase user (e.g. `role`, `workspaceId`).
- Updated `src/pages/Register.tsx` so that direct sign-ups (non-invite) create the initial workspace owner with an `Admin` role.
- Standardized workspace derivation across the app:
  - `workspaceId = user.workspaceId ?? user.id`.
  - All workspace-aware pages now filter data by `ownerId: workspaceId` to ensure owners and invited members see the same data.

**Role-Based Access Control (RBAC):**
- Implemented a clear permission model using the user's `role` from Cocobase metadata.
- Only Admins/owners can:
  - Invite and remove members (Members page).
  - Create events (Events page).
  - Post announcements (Announcements page).
  - Upload and delete files (Files page).
  - View Analytics.
- Updated UI components so non-admins:
  - Cannot see admin-only actions (buttons and forms are hidden/disabled).
  - Cannot access Analytics from the sidebar (`src/components/Sidebar.tsx`), and are blocked if they navigate directly.
  - See read-only views of data where appropriate.

**Members Page Updates (`src/pages/Members.tsx`):**
- Made the members table workspace-aware by filtering `members` documents using `workspaceId` instead of the raw `user.id`.
- Simplified the create-member payload to fields that match the Cocobase schema and removed extra/unnecessary fields that previously caused 500 errors.
- Integrated the new invite flow:
  - When an Admin invites a member, the app creates a `members` document with `status: 'invited'` and the correct `workspaceId`.
  - Generates the base64 invite payload and calls `sendInviteEmail` with a Netlify-ready invite URL.
  - Shows clear success/error toasts for both document creation and email sending.
- Enforced deletion permissions so only Admins can remove members.

**Events & Announcements (`src/pages/Events.tsx`, `src/pages/Announcements.tsx`):**
- Switched both pages to be workspace-based, using `ownerId = workspaceId` for all queries and mutations so invited users share the same event and announcement data.
- Restricted creation of new events and announcements to Admins only; non-admins see the content but cannot create or manage it.
- Added optional image URL support for events and announcements so admins can attach images (including from the Files page) to content.

**Dashboard & Analytics:**
- Updated `src/pages/Dashboard.tsx` to aggregate stats and recent activity at the workspace level instead of per-user:
  - Uses the shared `workspaceId` so that owners and invited members see the same counts and activity.
  - Quick-action cards are now permission-aware, only showing admin-only actions to admins.
- Implemented `src/pages/Analytics.tsx` as an Admin-only page wired to real Cocobase data:
  - Members: reads from the `members` collection for the current `workspaceId`.
  - Events: reads from the `events` collection.
  - Announcements: reads from the `announcements` collection.
  - Derives charts and summary metrics (totals, trends) from these collections.
  - Redirects or blocks access for non-admin users.

**Files Page (`src/pages/Files.tsx`):**
- Backed the Files page with a real Cocobase `files` collection that stores per-workspace file metadata:
  - Fields include `name`, `size`, `type`, `uploadedAt`, a data URL or file URL, and `ownerId: workspaceId`.
- Implemented file upload using `react-dropzone`:
  - Admins can drag-and-drop or click to upload.
  - Files are converted to data URLs and persisted via `db.createDocument('files', ...)`.
- Added admin-only delete support, calling `db.deleteDocument('files', id)`.
- Implemented "Copy link" functionality so admins can copy the file URL for use in events, announcements, or elsewhere.
- Non-admins can view/download files but cannot upload or delete.

**Settings Page (`src/pages/Settings.tsx`):**
- Implemented Settings with multiple sections:
  - **Profile:**
    - Shows the user email as read-only.
    - Allows editing of basic profile fields (e.g. `name`, `bio`) in the UI.
  - **Notifications:**
    - Toggle switches for email and push notifications, stored in local UI state.
  - **Danger Zone:**
    - Added Delete Account support via a Cocobase Cloud Function or API.
- Account Deletion:
  - Uses `VITE_ACCOUNT_DELETE_URL` from env.
  - Sends a `DELETE` or `POST` request (depending on configuration) with the current user's identifier.
  - On success, logs the user out and redirects them away from the app.
  - Shows confirmation and error toasts around the deletion flow.

**Routing & Netlify SPA Support:**
- Ensured that the Accept Invite route and all dashboard sub-routes work correctly on Netlify:
  - Confirmed `/accept-invite` is registered as a public route in `src/App.tsx` and loaded via `React.lazy`.
  - Accept Invite page no longer requires an auth session, but creates one after successful registration.
- Added SPA routing configuration:
  - Created/updated `netlify.toml` with a catch-all redirect sending all paths to `/index.html`.
  - Added a `_redirects` file with `/* /index.html 200` for Netlify, ensuring deep links to dashboard pages and invite URLs do not 404.

**Files Modified/Created:**
- `src/context/AuthContext.tsx` (extended `register` metadata usage)
- `src/lib/cocomailer.ts` (switched from Cocobase Cloud Function to Coco Mailer HTTP API)
- `src/pages/Register.tsx` (default new owners to Admin role)
- `src/pages/AcceptInvite.tsx` (base64 payload decoding, workspace-aware member lookup)
- `src/pages/Members.tsx` (workspace-aware members, simplified payload, invite link generation)
- `src/pages/Events.tsx` (workspace-based ownerId, role-based create, optional image URL)
- `src/pages/Announcements.tsx` (workspace-based ownerId, role-based create, optional image URL)
- `src/pages/Dashboard.tsx` (workspace-level stats and activity, admin-only quick actions)
- `src/pages/Analytics.tsx` (admin-only analytics wired to Cocobase)
- `src/pages/Files.tsx` (Cocobase-backed file metadata, admin-only upload/delete, copy link)
- `src/pages/Settings.tsx` (profile UI, notifications toggles, account deletion flow)
- `src/components/Sidebar.tsx` (hide Analytics for non-admins)
- `src/App.tsx` (public Accept Invite route and lazy loading)
- `netlify.toml` (SPA routing rules)
- `_redirects` (Netlify-compatible SPA redirect)
- `changelog.md` (this entry)


## 2025-11-19 08:20:00

### 🛠️ Registration, session persistence & announcements/navigation fixes

**Overview:**
- Fixed a regression where new signups sometimes saw "Registration failed" even though the account was actually being created.
- Hardened auth/session persistence so a page refresh no longer kicks users back to the login screen when they have a valid session.
- Exposed the Announcements page consistently across desktop and mobile navigation, and fixed a blank-page issue when opening Announcements from the dashboard.
- Resolved a runtime error on the Settings page caused by an undefined delete-account icon.

**Auth & Registration Flow Fixes (`src/context/AuthContext.tsx`, `src/pages/Register.tsx`):**
- Updated `AuthContext.register` to be more robust:
  - Still calls `db.register(email, password, { name, ...extra })` to create a Cocobase user with metadata.
  - After registration, it now checks `db.isAuthenticated()` and, if false, attempts an explicit `db.login(email, password)`.
  - Only if both the implicit session and the explicit login attempt fail does it throw an error ("Registration succeeded but login failed").
  - This prevents false "Registration failed" toasts when Cocobase does not automatically log the new user in after register.
- Kept the owner-member creation logic in `src/pages/Register.tsx` the same (creating an Admin member row with `displayRole` and `authUserId`), but that logic is isolated in its own try/catch so it cannot cause the registration step to fail.

**Auth Persistence & Refresh (`src/context/AuthContext.tsx`, `src/components/DashboardLayout.tsx`):**
- Added `localStorage` persistence for the authenticated user:
  - On successful register/login/Google-login, the enriched user (with `workspaceId` and `role`) is stored under the key `hf_auth_user`.
  - On logout, `hf_auth_user` is removed.
  - On app startup, `AuthProvider` first attempts to restore `hf_auth_user` from `localStorage` and only falls back to `db.isAuthenticated()` if nothing is stored.
- Updated `DashboardLayout` so that:
  - It shows a centered "Loading your workspace..." screen while auth is still being restored.
  - It only redirects to `/login` when `loading === false` and there is no authenticated user.
  - This prevents hard redirects to the login page on every refresh when the user actually has a valid session.

**Announcements Navigation & Blank Page Fix (`src/components/Navbar.tsx`, `src/pages/Announcements.tsx`, `src/pages/Dashboard.tsx`):**
- Navigation:
  - Added an **Announcements** link to the authenticated desktop navbar alongside Dashboard, Members, and Events.
  - Added an **Announcements** item to the authenticated mobile hamburger menu so admins can reach the page easily on phones.
  - Ensured the Dashboard quick action card "Send Announcement" navigates via React Router (`navigate('/announcements')`) instead of using `window.location.href`, avoiding full page reloads and session loss.
- Announcements page:
  - Fixed missing imports by explicitly importing `Label` and `Input` from the UI library at the top of `src/pages/Announcements.tsx`.
  - Corrected the React Query invalidation in the like mutation to target the workspace-scoped key: `['announcements', workspaceId]` instead of the raw `user.id`.
  - These fixes resolve the blank screen / runtime errors when opening the Announcements page from the dashboard or mobile nav.

**Settings Page Error Fix (`src/pages/Settings.tsx`):**
- Replaced the undefined `DeleteAccountIcon` component in the Danger Zone section with the existing `Trash2` icon from `lucide-react`:
  - Imported `Trash2` alongside the other icons.
  - Updated the Delete Account button to render `<Trash2 className="w-4 h-4 mr-2" />`.
- This removes the runtime error on the Settings page and restores the full Danger Zone UI (Logout + Delete Account) for all users.

**Files Modified:**
- `src/context/AuthContext.tsx`
- `src/components/DashboardLayout.tsx`
- `src/components/Navbar.tsx`
- `src/pages/Announcements.tsx`
- `src/pages/Register.tsx`
- `src/pages/Settings.tsx`
- `changelog.md` (this entry)

---

## 2025-11-19 14:30:00

### 🎨 Mobile members layout, profile avatars, HiveFlow branding & splash screen

**Overview:**
- Improved the mobile experience on the Members and Announcements pages.
- Enhanced the Settings page so profile name, bio, and avatar are persisted to Cocobase (and cached in localStorage).
- Rebranded the app UI from "ClubManager" to **HiveFlow** using the provided logo image.
- Added an animated splash screen that appears right after login/register/invite-accept before redirecting to the dashboard.

**Members Page Mobile Layout (`src/pages/Members.tsx`):**
- Kept the existing members **table** for desktop users but hid it on small screens with `hidden md:block`.
- Added a **mobile-first card list** (`md:hidden`) so each member appears as a compact glassmorphic card:
  - Shows avatar, name, role, email/phone (when not hidden for the owner), status badge, and joined date.
  - Preserves the existing `isAdmin`-only manage/remove actions.
- Removed the need for horizontal scrolling on phones while preserving feature parity with the desktop table.

**Announcements Mobile Spacing (`src/pages/Announcements.tsx`):**
- Wrapped the main content in `px-2 sm:px-0` to give announcements better side padding on small screens while leaving desktop spacing unchanged.

**Settings Profile & Avatar Persistence (`src/pages/Settings.tsx`):**
- Extended the profile section to support **real avatar upload** and persistence:
  - Added a hidden `<input type="file" accept="image/*">` triggered by the `Change Photo` button.
  - Validates file size (max 5MB) and reads the selected image as a **data URL**, which is used as the avatar preview.
- On mount, the Settings page now loads profile data from two sources:
  - `localStorage` (`hf_profile_<userId>`) – restores `name`, `bio`, and `avatar` if previously saved.
  - Cocobase `members` collection – looks up the current user by `ownerId = workspaceId or user.id` and `authUserId` (with a fallback lookup by `email`).
  - Prefers the member document's `name`, `bio`, and `avatar` when available.
- On **Save Changes**:
  - If a matching member document is found, calls `db.updateDocument('members', memberId, { name, bio, avatar })`.
  - Writes `{ name, bio, avatar }` back to `localStorage`.
  - Shows a loading state (`Saving...`) while the update is in progress.
- This ensures that profile info is consistent across Settings, Members, and sessions, even after refresh.

**HiveFlow Logo & Branding (`src/components/Navbar.tsx`, `src/pages/Login.tsx`, `src/pages/Register.tsx`, `src/pages/AcceptInvite.tsx`):**
- Updated the navbar brand from **ClubManager** to **HiveFlow**:
  - Replaced the generic `Users` icon with a rounded gradient block containing `/logo.jpg`.
  - Kept the neon cyan/indigo gradient text, now reading **HiveFlow**.
- Updated the **Login** and **Register** headers:
  - Replaced the `Users` icon with the same `/logo.jpg` block, creating a consistent brand moment on auth screens.
- Updated the **Accept Invite** flow so that, after a successful invite acceptance, the user is sent to the new splash screen instead of directly to `/dashboard`.

**Animated Splash Screen (`src/pages/Splash.tsx`, `src/App.tsx`, `tailwind.config.js`):**
- Created a new `Splash` page with a glassmorphic card that:
  - Displays the HiveFlow logo and a personalized welcome message like `Hey Alex, your workspace is getting ready...`.
  - Shows an animated loading bar using a new Tailwind `loading-bar` keyframe.
  - After ~2 seconds, automatically navigates the user to `/dashboard`.
- Integrated `PrefsContext` so the splash honors the user's **reduced motion** preference:
  - Uses toned-down Framer Motion animations when `prefersReducedMotion` is `true`.
- Added a `loading-bar` keyframe and `animate-loading-bar` utility to `tailwind.config.js` and wired the progress bar to use it.
- Updated routing in `src/App.tsx`:
  - Added `const Splash = lazy(() => import('./pages/Splash'));`.
  - Registered `/splash` as a **protected route** inside `DashboardLayout`, ensuring only authenticated users see it.
- Updated `Login`, `Register`, and `AcceptInvite` to navigate to `/splash` after successful auth instead of going straight to `/dashboard`.

**Files Modified / Created:**
- `src/pages/Members.tsx` (mobile card layout)
- `src/pages/Announcements.tsx` (mobile padding tweaks)
- `src/pages/Settings.tsx` (avatar upload, profile persistence to Cocobase + localStorage)
- `src/components/Navbar.tsx` (HiveFlow branding + logo integration)
- `src/pages/Login.tsx` (logo header, redirect to splash)
- `src/pages/Register.tsx` (logo header, redirect to splash)
- `src/pages/AcceptInvite.tsx` (redirect to splash)
- `src/pages/Splash.tsx` (new animated splash screen)
- `src/App.tsx` (protected `/splash` route registration)
- `tailwind.config.js` (loading bar keyframes and animation)
- `changelog.md` (this entry)

---

## 2025-11-19 15:05:00

### 📆 Events RSVP fix & 💬 per-event chat

**Overview:**
- Tightened the Events page to use workspace-scoped cache keys for RSVPs.
- Added a simple per-event chat feature backed by a new `event_chats` collection so members can discuss each event.

**Events RSVP Cache Fix (`src/pages/Events.tsx`):**
- Updated the RSVP mutation to invalidate the same workspace-scoped query key used for loading events:
  - Before: `queryClient.invalidateQueries({ queryKey: ['events', user?.id] });`
  - After:  `queryClient.invalidateQueries({ queryKey: ['events', workspaceId] });`
- This ensures that when a user RSVPs or cancels, the events list is correctly refetched for the current workspace and stays in sync with Cocobase.

**Per-Event Chat (`src/pages/Events.tsx`, `event_chats` collection):**
- Introduced a lightweight chat thread per event so members can coordinate details and share updates.
- Data model:
  - New Cocobase collection: **`event_chats`**.
  - Fields written by the frontend:
    - `ownerId` (string) – workspace id (same as `events.ownerId`).
    - `eventId` (string) – id of the event being discussed.
    - `authorId` (string) – Cocobase user id of the sender.
    - `authorName` (string) – display name of the sender.
    - `message` (string) – chat message body.
    - `createdAt` (string, ISO timestamp).
- UI behavior on the Events page:
  - Each event card now has two actions:
    - **Open Chat** – opens a modal dialog for that event's discussion.
    - **RSVP / Cancel RSVP** – existing behavior preserved.
  - When **Open Chat** is clicked:
    - A dialog appears showing a scrollable list of messages for that event.
    - Messages are loaded via React Query using `db.listDocuments('event_chats', { filters: { ownerId: workspaceId, eventId }, sort: 'created_at', order: 'asc' })`.
    - Chat auto-refreshes every few seconds while the dialog is open.
    - Shows helpful states: loading, error, and an empty-state prompt when there are no messages yet.
  - Sending a message:
    - All authenticated workspace members can post messages.
    - The form validates non-empty text and then calls `db.createDocument('event_chats', { ownerId, eventId, authorId, authorName, message, createdAt })`.
    - On success, the input clears and the `['event-chats', workspaceId, eventId]` query is invalidated to refresh the thread.

**Files Modified:**
- `src/pages/Events.tsx` (RSVP cache key fix and per-event chat modal wired to `event_chats`)
- `changelog.md` (this entry)


## 2025-11-19 16:10:00

### 👤 Avatar propagation hardening & 🗑️ admin delete for announcements/events

**Overview:**
- Tightened how profile avatars and names flow from Settings into the authenticated user object so that announcements consistently show the correct profile picture across devices.
- Added admin-only delete actions for announcements and events so workspace owners/admins can clean up outdated content.

**Avatar Propagation & Auth (`src/context/AuthContext.tsx`, `src/pages/Settings.tsx`):**
- `AuthContext.buildUserWithWorkspace` now:
  - Hydrates `name` and `avatar` from a per-user local profile cache `hf_profile_<userId>` when available.
  - Falls back to the latest `members` document for that `authUserId` (or email) and then to the raw Cocobase user object.
- Session restore was hardened so that even when a stored `hf_auth_user` exists, the app still verifies the Cocobase session and re-enriches the user via `buildUserWithWorkspace`, updating `hf_auth_user` with the freshest name/avatar/workspace metadata.
- Settings profile save was updated to backfill missing member documents:
  - If no `members` document exists yet for the current workspace/user, `handleSaveProfile` now creates one with `ownerId`, `authUserId`, `email`, `name`, `bio`, `avatar`, and `role`.
  - This ensures that legacy workspace owners (who were created before the members-collection work) still get a Cocobase-backed avatar/name that can be read on other devices.
  - Settings continues to write `{ name, bio, avatar }` to `hf_profile_<userId>` and calls `refreshUser()` so navbar, announcements, dashboard, and other pages see the updated profile immediately.

**Announcements Avatar Usage & Admin Delete (`src/pages/Announcements.tsx`):**
- Announcements now prefer the current user's avatar when determining the author avatar:
  - When mapping Cocobase `announcements` documents into UI cards, the code checks whether `authorName` matches the current `user.name` or `user.email` and, if so, uses `user.avatar`.
  - Falls back to the stored `authorAvatar` on the document and then to a generic generated avatar.
- The admin composer card was tweaked for mobile:
  - Uses `p-4 sm:p-6` and a `flex-col sm:flex-row` layout so avatar, textarea, and actions stack cleanly on phones.
- Added an admin-only **Delete** action per announcement:
  - Introduced a `deleteAnnouncementMutation` that calls `db.deleteDocument('announcements', id)` and invalidates `['announcements', workspaceId]`.
  - Added a small "Delete" button to each announcement card for admins, with a confirmation dialog before delete.

**Events Admin Delete & Chat Mutation (`src/pages/Events.tsx`):**
- Added delete support for events, restricted to admins:
  - New `deleteEventMutation` checks authentication and admin role, then calls `db.deleteDocument('events', id)` and invalidates the workspace-scoped events query.
  - Each event card now shows a **Delete** button for admins alongside **Open Chat** and **RSVP**.
  - Deletes prompt for confirmation and surface success/error via toasts.
- Updated the per-event chat send-message button to use the correct React Query mutation state (`isPending`), preventing TypeScript errors while preserving the loading UX ("Sending...").

**Files Modified:**
- `src/context/AuthContext.tsx` (session re-enrichment + profile cache hydration)
- `src/pages/Settings.tsx` (create missing members doc on profile save)
- `src/pages/Announcements.tsx` (author avatar preference and admin delete button)
- `src/pages/Events.tsx` (admin-only delete mutation and chat loading-state fix)
- `changelog.md` (this entry)


## 2025-11-19 16:30:00

### ⏳ Splash screen timing & refresh behavior

**Overview:**
- Extended the HiveFlow splash screen to last for a full 5 seconds.
- Ensured that after login/register or a page refresh on any authenticated route, users see the splash before being returned to their intended page.

**Splash Behavior (`src/pages/Splash.tsx`):**
- Updated the splash timer from 2 seconds to 5 seconds.
- The Splash page now reads an optional `next` route from `location.state` and, after 5 seconds, navigates to that route (`navigate(next, { replace: true })`).
- Defaults to redirecting to `/dashboard` when no `next` value is provided (e.g. from login/register flows).

**Initial Authenticated Load Redirect (`src/components/DashboardLayout.tsx`):**
- Enhanced `DashboardLayout` so that on the **first authenticated load** of any protected route (e.g. `/dashboard`, `/events`, `/announcements`, `/settings`), it:
  - Skips the behavior entirely when the current route is `/splash`.
  - Otherwise computes the current path + query/hash as `next`.
  - Redirects to `/splash` with `state: { next }` so the Splash page can send the user back after 5 seconds.
- Uses an internal `hasHandledInitial` ref to ensure this redirect only happens once per app mount, avoiding extra splash transitions during normal in-app navigation.

**Resulting UX:**
- After login, register, or accepting an invite, users land on `/splash` for 5 seconds and are then taken to their dashboard.
- When a logged-in user refreshes the app on any dashboard route (e.g. `/events`), they see the 5-second splash first and are then returned to the same route.

**Files Modified:**
- `src/pages/Splash.tsx` (5-second timer and `next` route handling)
- `src/components/DashboardLayout.tsx` (initial authenticated load redirect into Splash)
- `changelog.md` (this entry)


## 2025-11-19 16:40:00

### 🔁 Auth persistence tweak for splash-on-refresh

**Overview:**
- Adjusted auth/session restore so that a previously stored `hf_auth_user` continues to be treated as authenticated across full page reloads, even if `db.isAuthenticated()` returns false, while still enriching from Cocobase when possible.

**Details (`src/context/AuthContext.tsx`):**
- On startup, `AuthProvider` now:
  - Attempts to parse `hf_auth_user` from `localStorage` and immediately seeds the `user` state from it.
  - Calls `db.isAuthenticated()`; if true, it rebuilds the enriched user via `buildUserWithWorkspace()` and overwrites both context and `hf_auth_user` with the fresh value.
  - If `db.isAuthenticated()` is false **and there was no valid stored user**, it logs the user out and clears `hf_auth_user`.
  - If a stored user exists but the Cocobase session is not active, it keeps the stored user instead of forcing a logout, preserving the in-app logged-in experience across refreshes.

**Result:**
- Combined with the new splash-on-refresh behavior in `DashboardLayout`, authenticated users now:
  - Stay logged in when they hard-refresh on any dashboard route.
  - See the 5-second HiveFlow splash first, and are then returned to the page they were on before the refresh.

**Files Modified:**
- `src/context/AuthContext.tsx` (relaxed restore logic around `hf_auth_user` and `db.isAuthenticated()`)
- `changelog.md` (this entry)

