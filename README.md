# Admin Dashboard (Internship Assignment)

> A modern, responsive, and robust Admin Dashboard built with React, TypeScript, and Material UI. 
> Enhanced and optimized by **Bhagya**.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![React](https://img.shields.io/badge/React-18.0.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)

## 🚀 Project Overview

This project is a sophisticated Admin Dashboard designed to manage users and roles efficiently. It leverages the power of **Material React Table (MRT)** for a dynamic data grid experience, **React Query** for efficient caching and synchronization, and **MSW** for seamless API mocking during development.

KEY FOCUS: Fixing intentional architectural bugs, optimizing performance, and ensuring production-grade type safety.

## ✨ Key Features

- **Dynamic Data Grid**: High-performance table with sorting, filtering, and custom cell rendering.
- **Advanced State Management**: URL-synchronized pagination, search, and filters.
- **Optimized Performance**: Debounced search and efficient cache invalidation.
- **Smooth UX**: Loading skeletons and optimistic UI updates.
- **Robust Error Handling**: Custom error boundaries and user-friendly error messages.
- **Strict Type Safety**: Fully typed with TypeScript strict mode enabled.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety (Strict Mode) |
| **Material React Table** | Advanced Data Grid |
| **Material UI (MUI)** | Component Library |
| **React Query** | Data Fetching & Caching |
| **MSW** | Mock Service Worker (API Mocking) |
| **React Router v6** | Client-Side Routing |
| **Vitest** | Unit Testing |

---

## 🔧 Improvements & Fixes Implemented

This project started with intentional bugs and incomplete features. Here is a summary of the work done to bring it to a production-ready state:

### 🐛 Critical Bug Fixes
1.  **Cache Invalidation**: Fixed `useUsers` hook to ensure the table refreshes automatically after a user status update.
2.  **Chiplist Renderer**: Repaired the "Groups" column renderer in `DynamicGrid` to correctly display group names as colored chips with icons.
3.  **URL Synchronization**: Implemented bidirectional sync between URL parameters and table state (pagination, filters, search) using `useSearchParams`.

### 🚀 Feature Enhancements
1.  **Debounced Search**: Implemented a custom `useDebounce` hook to optimize API calls, preventing excessive network requests during typing.
2.  **Loading Skeletons**: Added a visual skeleton loader to `DynamicGrid` for a smoother user experience during data fetching.
3.  **Build Optimization**: Resolved TypeScript strict mode compilation errors by cleaning up unused imports and fixing type mismatches in test files.
4.  **UI Polish**: Added "Internship Assignment (Bhagya)" to the navbar for personalization.

---

## 🏁 Getting Started

Follow these steps to set up the project locally:

### 1. Clone & Install
```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd admin-dashboard-assignment

# Install dependencies
npm install
```

### 2. Initialize MSW
This project uses Mock Service Worker. You must initialize it once:
```bash
npx msw init public --save
```

### 3. Run Development Server
```bash
npm run dev
```
The app will be available at [http://localhost:5173](http://localhost:5173).

### 4. Build for Production
```bash
npm run build
```

---

## 🧪 Testing

Run the test suite to verify the application logic:
```bash
npm test
```

---

<center>
  <sub>Built with ❤️ by Bhagya</sub>
</center>
