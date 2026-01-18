# Admin Dashboard - Users Page

A fully functional admin dashboard built as part of an internship technical assessment. All bugs have been fixed, features completed, and bonus features implemented.

## Quick Start

```bash
# Install dependencies
npm install

# Initialize MSW (required for mock API)
npx msw init public --save

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

The app will be available at http://localhost:5173

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety (strict mode) |
| Material React Table (MRT) | Data Grid |
| Material UI (MUI 6) | Component Library |
| React Query | Data Fetching & Caching |
| MSW | Mock API |
| React Router v6 | Routing |
| Notistack | Toast Notifications |
| Vitest | Unit Testing |

## High-Level Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              App Architecture                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   App.tsx   │───▶│   Router    │───▶│   Layout    │───▶│  UsersPage  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                   │         │
│                                                                   ▼         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         UsersPage Components                          │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Search    │  │   Status    │  │ DynamicGrid │  │ UserActions │  │  │
│  │  │   (300ms    │  │   Filter    │  │   (Table)   │  │  (Toggle)   │  │  │
│  │  │  debounced) │  │             │  │             │  │             │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                          │                                  │
│                                          ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                           Custom Hooks                                │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  useUsers          - Fetch users with React Query                    │  │
│  │  useUpdateStatus   - Optimistic UI updates with rollback             │  │
│  │  useDebounce       - Debounce search input (300ms)                   │  │
│  │  useNetworkStatus  - Detect online/offline status                    │  │
│  │  useLocalStorage   - Persist preferences to localStorage             │  │
│  │  useTablePrefs     - Save column visibility, sorting, density        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                          │                                  │
│                                          ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         State Management                              │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  React Query Cache  ◀──────────────▶  URL Search Params              │  │
│  │  (Server State)                        (Pagination/Filters)          │  │
│  │         │                                      │                      │  │
│  │         ▼                                      ▼                      │  │
│  │  localStorage       ◀──────────────▶  Component State                │  │
│  │  (User Preferences)                    (UI State)                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                          │                                  │
│                                          ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                           Mock API (MSW)                              │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  GET  /api/users?page=&pageSize=&query=&status=  - Fetch users       │  │
│  │  PATCH /api/users/:id                            - Update status     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action ──▶ Component ──▶ Custom Hook ──▶ React Query ──▶ MSW API
                    │              │               │
                    │              │               ▼
                    │              │         Cache Update
                    │              │               │
                    │              ▼               ▼
                    │         URL Sync ◀──── Re-render
                    │              │
                    ▼              ▼
              localStorage    Browser URL
```

## Project Structure

```
src/
├── api/                  # API calls (fetchUsers, updateUserStatus)
├── components/
│   ├── tables/           # DynamicGrid, UserActions
│   ├── ErrorBoundary.tsx # Error handling components
│   └── index.ts
├── hooks/
│   ├── useUsers.ts       # Data fetching with React Query
│   ├── useDebounce.ts    # Debounce hook
│   ├── useLocalStorage.ts# localStorage persistence
│   ├── useNetworkStatus.ts# Online/offline detection
│   └── index.ts
├── layouts/              # Page layouts
├── mocks/                # MSW mock handlers
├── pages/
│   └── UsersPage/        # Main users page
├── types/                # TypeScript types
├── utils/                # Utilities & column config
├── test/                 # Test setup
├── App.tsx
├── main.tsx
└── routes.tsx
```

---

## Completed Tasks

### Part 1: Bug Fixes (Required) ✅

| Bug | Status | Description | File |
|-----|--------|-------------|------|
| Bug #1 | ✅ Fixed | **Cache Invalidation** - Table now refreshes after status update using `queryClient.invalidateQueries()` in `onSettled` callback | `src/hooks/useUsers.ts` |
| Bug #2 | ✅ Fixed | **Groups Column** - Fixed chiplist renderer to properly display `group.groupName` instead of `[object Object]` | `src/components/tables/DynamicGrid.tsx` |
| Bug #3 | ✅ Fixed | **URL Sync** - Pagination, filters, and search now sync with URL params. Page persists on refresh using `useRef` to prevent reset on mount | `src/pages/UsersPage/UsersPage.tsx` |

### Part 2: Complete Features (Required) ✅

| Feature | Status | Description | File |
|---------|--------|-------------|------|
| Feature #1 | ✅ Done | **Debounced Search** - 300ms debounce using `useDebounce` hook prevents API calls on every keystroke | `src/hooks/useDebounce.ts` |
| Feature #2 | ✅ Done | **Loading Skeleton** - Custom `TableSkeleton` component shows placeholder rows matching table structure | `src/components/tables/DynamicGrid.tsx` |
| Feature #3 | ✅ Done | **Optimistic UI** - Immediate UI update on status toggle with automatic rollback on error using `onMutate`/`onError` | `src/hooks/useUsers.ts` |

### Part 3: New Features (Required) ✅

| Feature | Status | Description | File |
|---------|--------|-------------|------|
| Feature #1 | ✅ Done | **Enhanced Actions** - Confirmation dialog before deactivating, hover states with scale animation, keyboard navigation, proper ARIA labels | `src/components/tables/UserActions.tsx` |
| Feature #2 | ✅ Done | **Error Handling** - ErrorBoundary component, offline detection with `useNetworkStatus`, user-friendly error messages, retry functionality, OfflineBanner component | `src/components/ErrorBoundary.tsx`, `src/hooks/useNetworkStatus.ts` |

### Bonus Features (Optional) ✅

| Bonus | Status | Description | File |
|-------|--------|-------------|------|
| Bonus A | ✅ Done | **localStorage Persistence** - Column visibility, sorting, and density preferences saved per table | `src/hooks/useLocalStorage.ts` |
| Bonus B | ✅ Done | **Unit Tests** - 23 tests for `useDebounce` hook (7 tests) and `DynamicGrid` component (16 tests) | `src/hooks/useDebounce.test.ts`, `src/components/tables/DynamicGrid.test.tsx` |
| Bonus C | ✅ Done | **Role-Based UI** - Visual indicators with colored badges and icons for all user groups (Admin, Management, Content, Standard, Read Only) | `src/components/tables/DynamicGrid.tsx` |

---

## Key Implementation Details

### Bug #1: Cache Invalidation Fix
```typescript
// src/hooks/useUsers.ts
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
}
```

### Bug #3: URL Sync with Pagination Persistence
```typescript
// Prevents pagination reset on page refresh
const isInitialMount = useRef(true);
useEffect(() => {
  if (isInitialMount.current) {
    isInitialMount.current = false;
    return; // Skip reset on initial mount
  }
  // Only reset when filters actually change
}, [debouncedSearchQuery, statusFilter]);
```

### Optimistic UI Pattern
```typescript
onMutate: async ({ userId, status }) => {
  await queryClient.cancelQueries({ queryKey: userQueryKeys.all });
  const previousQueries = queryClient.getQueriesData({ queryKey: userQueryKeys.all });
  // Optimistically update cache
  queryClient.setQueriesData({ queryKey: userQueryKeys.all }, (old) => /* update */);
  return { previousQueries }; // For rollback
},
onError: (error, variables, context) => {
  // Rollback on error
  context.previousQueries.forEach(([key, data]) => queryClient.setQueryData(key, data));
}
```

### Role-Based UI with Icons
| Group | Color | Icon |
|-------|-------|------|
| Administrators | Red | AdminPanelSettingsIcon |
| Management Team | Orange | SupervisorAccountIcon |
| Content Team | Blue | CreateIcon |
| Standard Users | Purple | PersonIcon |
| Read Only | Green | VisibilityIcon |

---

## Testing

```bash
# Run all tests
npm test

# Test results: 23 tests passing
# - useDebounce.test.ts: 7 tests
# - DynamicGrid.test.tsx: 16 tests
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run lint` | Run ESLint |

---

## Submission Checklist

- [x] All 3 bugs fixed
- [x] Debounced search working
- [x] Loading skeleton added
- [x] Optimistic UI implemented
- [x] Error handling improved
- [x] Separate git commits for each fix/feature
- [x] README updated with changes
- [x] (Bonus) localStorage persistence
- [x] (Bonus) Unit tests (23 tests)
- [x] (Bonus) Role-based UI with icons
