# Development Guidelines for Project Escrow App

## Project Overview

A job/project escrow management platform built with React, supporting real-time job applications, work progress tracking, and milestone-based fund management.

**Primary Language**: Japanese (with English fallback support via i18n)

---

## Technology Stack

### Core

- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Styling and responsive design

### Libraries

- **dnd-kit v6+** - Drag-and-drop functionality
- **react-i18next** - Internationalization (i18n)
- **Fetch API** - HTTP requests (no external library)

### State Management

- **Event-driven Architecture** - Uses `CustomEvent` with `window.dispatchEvent()`
- No Redux, no Context API for global state
- Local component state for UI-specific data
- Example: `window.dispatchEvent(new CustomEvent('updatePendingApplications', { detail: { jobId, status } }))`

---

## Project Structure

```
src/
├── components/
│   ├── common/        # Reusable UI components
│   ├── dashboard/     # Job/project cards and list items
│   ├── layout/        # Header, Sidebar
│   ├── market/        # Job market/search specific components
│   └── modals/        # Modal dialogs
├── pages/             # Full-page components (route targets)
├── data/              # Dummy/mock data
├── hooks/             # Custom React hooks
├── utils/             # Helper functions
└── locales/           # i18n translation files (en, ja)
```

---

## Key Design Patterns & Rules

### 1. Button States - Disabled Appearance

When a button or interactive element is disabled:

- **Background**: Use `bg-slate-300` (neutral gray)
- **Text**: Use `text-slate-500` (muted gray)
- **Cursor**: Add `cursor-not-allowed`
- **Opacity**: Reduce to `opacity-60`
- **Hover**: Remove all hover effects (no gradient transitions, no shadow changes)
- **Pattern**: Use conditional className with ternary operator

**Example**:

```jsx
<button
  className={`px-4 py-2 rounded-lg font-bold transition whitespace-nowrap ${
    isDisabled
      ? "bg-slate-300 text-slate-500 cursor-not-allowed opacity-60"
      : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl"
  }`}
  disabled={isDisabled}
>
  Label
</button>
```

### 2. Application Status States

Jobs/projects can have these application states:

- **pending** (`応募中`) - Application submitted, waiting for decision
- **accepted** (`採用済み`) - Application accepted/selected
- **rejected** (`不採用`) - Application rejected

**Visual Representation**:

- Pending: Gray, disabled appearance (see rule #1)
- Accepted/Rejected: Same disabled appearance (non-interactive)

### 3. Page Tabs

WorkManagementPage uses tabs for job status:

- **応募中 (Pending)** - Read-only, shows badge "Under Review", displays guidance banner
- **進行中 (In Progress)** - Interactive, cards can be managed
- **完了 (Completed)** - Read-only, displays past work

Tab labels should show count badges: `Tab Name (count)`

### 4. Event-Driven State Sync

Cross-component state updates use CustomEvent:

```javascript
// Dispatch
window.dispatchEvent(
  new CustomEvent("updatePendingApplications", {
    detail: { jobId, status, clientName, appliedDate },
  }),
);

// Listen
window.addEventListener("updatePendingApplications", (e) => {
  const { jobId, status } = e.detail;
  // Update local state
});
```

**Usage Pattern**:

- Use for cross-page communication (JobsSearchPage → WorkManagementPage)
- Avoid for single-page state (use local state instead)
- Event names should be descriptive verb phrases

### 5. Internationalization (i18n)

- Translation files in `src/locales/{lang}/translation.json`
- Use `useTranslation()` hook in components
- JSX keys must match translation file structure
- Fallback language is English

**Example**:

```jsx
import { useTranslation } from "react-i18next";

export default function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t("common.title")}</h1>;
}
```

### 6. Styling Rules

- Use **Tailwind CSS** utility classes exclusively
- No CSS-in-JS or separate CSS files for component styling
- Use `className` for conditional styles (ternary operator recommended)
- Responsive design: use `md:` breakpoint for tablet+ screens
- Color palette: Use Tailwind's color names (indigo, slate, gray, etc.)

### 7. Card/List Item Styling

Pending/disabled cards should show:

- `opacity-75` or `opacity-60` for visual distinction
- `cursor-not-allowed` to indicate non-interactivity
- Grayed-out text using slate color classes
- Example: `cursor-not-allowed opacity-75 grayscale text-slate-600`

### 8. Commit Message Convention

- **Format**: `type: Description`
- **Types**: `feat:` (feature), `fix:` (bug fix), `refactor:` (code reorganization), `docs:` (documentation), `style:` (formatting)
- **Examples**:
  - `feat: Add pending tab guidance banner`
  - `fix: Style disabled button with gray background`
  - `refactor: Clean up unused comments`

### 9. Code Comments Language

- **All code comments must be in English** - Use `//` and `/* */` comments exclusively in English
- **Exceptions**: Inline strings and translations (JSX text, i18n keys) are Japanese as per UI requirements
- **Reasoning**: Code maintainability across international team; English as lingua franca for technical documentation
- **Examples**:

  ```javascript
  // Good: English comment
  // Fetch pending job applications for current user
  const pendingJobs = getPendingApplicationsForUser(userId);

  // Bad: Japanese comment
  // ユーザーの応募中の仕事を取得
  const pendingJobs = getPendingApplicationsForUser(userId);

  // Good: Japanese in UI text (intentional)
  return <span>{t("common.pendingStatus")}</span>; // "応募中" in translation.json
  ```

---

## Common Tasks

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `src/App.js` (React Router v6 syntax)
3. Add navigation link in `src/components/layout/Sidebar.js` or `Header.js`
4. Add i18n translation keys in both `en/translation.json` and `ja/translation.json`

### Modifying Card Components

1. Keep both `common/` generic and `dashboard/`-specific versions separate
2. Use Tailwind for styling (no inline styles)
3. Test both pending and active states visually
4. Ensure disabled buttons follow rule #1

### Cross-Page State Updates

1. Use `window.dispatchEvent(new CustomEvent(...))` from source page
2. Add `window.addEventListener()` in target page's `useEffect` with cleanup
3. Document the event name and detail structure in code comments

---

## Testing Checklist

- [ ] All text properly translates to Japanese and English
- [ ] Disabled states visually appear non-interactive (gray, cursor-not-allowed)
- [ ] Responsive design works on mobile (`md:` breakpoints)
- [ ] Drag-and-drop works correctly (if applicable)
- [ ] No console errors in browser DevTools
- [ ] Event-driven updates propagate correctly across pages

---

## Known Issues & Workarounds

- Git history may reset; always make small, atomic commits
- Drag-and-drop state doesn't persist across page refreshes (expected behavior for demo)
- i18n requires browser reload to switch languages (expected)

---

## Work Assignment Process

When accepting a new work assignment or feature request:

1. **Review these guidelines first** - Read this DEVELOPMENT_GUIDELINES.md to refresh key patterns and rules
2. **Check project structure** - Familiarize yourself with current directory layout and existing patterns
3. **Clarify requirements** - Ask explicit questions about expected behavior, scope, and acceptance criteria
4. **Reference existing code** - Look for similar implementations before writing new code
5. **Follow established patterns** - Adhere to commit message conventions, i18n structure, styling rules, and event-driven architecture
6. **Verify testing checklist** - Ensure all items are completed before marking work as done

**Note**: Automatic workflow checks are not currently configured. This process requires manual attention at the start of each assignment. Always explicitly reference relevant sections of these guidelines when implementing changes.

---

## Session Continuity

When starting a new development session:

1. Read this file first
2. Check recent commits: `git log --oneline -10`
3. Verify no uncommitted changes: `git status`
4. Review current branch and feature work
5. Ask clarifying questions about next steps

---

Last Updated: February 1, 2026
