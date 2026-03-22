# Course-Based Modular Dashboard System

## Overview

The application now supports a **course-based modular dashboard** where users can select from JEE, NEET, or UPSC and the entire learning experience adapts dynamically based on the selected course.

## Architecture

### Components & Files

#### 1. **CourseContext** (`src/contexts/CourseContext.tsx`)
Global context that manages course state across the entire application.

**Features:**
- Stores `selectedCourse` (jee | neet | upsc)
- Provides `setSelectedCourse()` function
- Auto-persists to localStorage
- Provides custom hook: `useCourse()`

**Usage in Components:**
```tsx
import { useCourse } from "@/contexts/CourseContext";

function MyComponent() {
  const { selectedCourse, setSelectedCourse } = useCourse();
  
  return (
    <>
      <p>Current Course: {selectedCourse}</p>
      <button onClick={() => setSelectedCourse('neet')}>Switch to NEET</button>
    </>
  );
}
```

#### 2. **Course Data System** (`src/utils/courseData.ts`)
Centralized mock/dummy data for all courses.

**Exports:**
- `courseDataMap` - Data for JEE, NEET, UPSC with subjects, stats, etc.
- `getCourseData(course)` - Get data for a specific course
- `getCourseColorScheme(course)` - Color scheme for each course
- `getMockCourseStats(course)` - Course-specific stats
- `courseEmojis` - Emoji icons for each course

**Data Structure:**
```tsx
interface CourseData {
  name: string;              // "JEE Main & Advanced"
  acronym: string;           // "JEE"
  icon: string;              // "⚛️"
  color: string;             // "blue", "emerald", "purple"
  description: string;
  subjects: string[];        // ["Physics", "Chemistry", "Math"]
  totalTopics: number;
  accuracy: number;          // 75%
  strengths: string[];
  weaknesses: string[];
  lastStudied: string;
  totalHours: number;
  completionPercentage: number;
  studyStreak: number;
  nextMilestone: string;
}
```

**Color Scheme by Course:**
- **JEE**: Blue (`bg-blue-500/10`, `text-blue-600`, etc.)
- **NEET**: Emerald (`bg-emerald-500/10`, `text-emerald-600`, etc.)
- **UPSC**: Purple (`bg-purple-500/10`, `text-purple-600`, etc.)

#### 3. **Sidebar Course Selector** (`src/components/CourseSelectorPanel.tsx`)
Adds "My Courses" section to the sidebar with course options.

**Features:**
- Shows 3 course cards (JEE, NEET, UPSC)
- Active course is highlighted with glow effect
- Smooth animations on selection
- "Enroll in Course" button (UI only)
- Auto-hides on mobile (only shows in full sidebar)

**Visual Design:**
- Active indicator: Cyan gradient background + small dot
- Icons: Course emojis (⚛️, 🔬, ⚖️)
- Hover effects: Scale animation + semi-transparent background

#### 4. **Current Course Indicator** (`src/components/CurrentCourseIndicator.tsx`)
Displays selected course at the top of the page.

**Features:**
- Shows: "Currently studying: [Course Name] 🔥"
- Color-coded gradient for each course
- Smooth fade animation when course changes
- Responsive: Hidden on small screens, shown on md+

**Colors:**
- JEE: Blue gradient
- NEET: Emerald gradient  
- UPSC: Purple gradient

#### 5. **Custom Course Hooks** (`src/hooks/useCourse.ts`)
Utility hooks for course management in pages.

**Available Hooks:**
- `useCourseFromParams()` - Syncs URL params with context
- `useCourseNavigation()` - Navigate while maintaining course
- `useCourseOrParam()` - Get course from param or context

**Usage:**
```tsx
import { useCourseFromParams } from "@/hooks/useCourse";

function MyPage() {
  const { course } = useCourseFromParams(); // Handles /page/:course URLs
  // ...
}
```

### Integration Points

#### 1. **App Router** (`src/App.tsx`)
Routes updated to support both old and new patterns:

**Old routes (backward compatible):**
```
/dashboard, /planner, /practice, /analytics, etc.
```

**New course-based routes:**
```
/dashboard/:course
/planner/:course
/practice/:course
/analytics/:course
/doubt/:course
/ai-solver/:course
/one-pager/:course
/interview/:course
/notes/:course
/gamification/:course
```

**Provider Hierarchy:**
```
<ThemeProvider>
  <CourseProvider>  ← Wraps entire app
    <QueryClientProvider>
      <Router>...</Router>
    </QueryClientProvider>
  </CourseProvider>
</ThemeProvider>
```

#### 2. **Sidebar Update** (`src/components/layout/AppSidebar.tsx`)
Added `<CourseSelectorPanel />` component that renders below "Tools" section.

State management: Shows only when sidebar is expanded (not collapsed).

#### 3. **Top Navigation** (`src/components/layout/TopNav.tsx`)
Added `<CurrentCourseIndicator />` component showing current course.

State management: Hidden on mobile, shown on md+ breakpoints.

#### 4. **Dashboard Page** (`src/pages/Dashboard.tsx`)
Updated to use CourseContext and display course-specific data.

**Changes:**
- Imports `useCourse` and course data utilities
- Gets course-specific data on mount
- Shows course name in title/badge
- Displays course accuracy, completion %, streak
- Color scheme adapts to selected course
- Links in CTAs update `/practice/:course` pattern

## Usage Guide

### For Users

#### Switching Courses
1. Look at sidebar → scroll to "My Courses" section
2. Click on JEE/NEET/UPSC card
3. Dashboard updates immediately with course-specific data
4. Current course shown at top of page

#### Accessing Course-Specific Pages
- Navigate normally through sidebar
- Selected course is maintained across all pages
- OR use course-specific URLs: `/dashboard/jee`, `/planner/neet`, etc.

### For Developers

#### Adding Course Selector to a New Page

```tsx
import { useCourse } from "@/contexts/CourseContext";
import { getCourseData } from "@/utils/courseData";

export default function MyPage() {
  const { selectedCourse } = useCourse();
  const courseData = getCourseData(selectedCourse);
  
  return (
    <div>
      <h1>{courseData.name}</h1>
      <p>{courseData.description}</p>
      {/* Your page content */}
    </div>
  );
}
```

#### Loading Course-Specific Stats

```tsx
import { getMockCourseStats } from "@/utils/courseData";

const stats = getMockCourseStats('jee');
// Returns: { todayProgress, weekProgress, subjectProgress, recentTopics }
```

#### Applying Course Color Scheme

```tsx
import { getCourseColorScheme } from "@/utils/courseData";

const colors = getCourseColorScheme(selectedCourse);
// Returns: { bg, border, text, darkText, badge, button }

<div className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
  Content...
</div>
```

#### Creating Course-Specific Links

```tsx
// Instead of:
<Link to="/practice">Start</Link>

// Use:
<Link to={`/practice/${selectedCourse}`}>Start</Link>
```

## Data Implementation

### Current State: Mock Data
All course data is **mock/dummy data** in `utils/courseData.ts`:
- Course names, descriptions, icons
- Subject lists
- Mock statistics (accuracy, completion %, etc.)
- Study streaks, total hours

### Future: Backend Integration
To connect to real backend data:

1. **Create API endpoint:** `/api/v1/courses/:courseId/stats`
2. **Update pages** to fetch from API instead of using mock data:
```tsx
const [stats, setStats] = useState(null);

useEffect(() => {
  fetch(`/api/v1/courses/${selectedCourse}/stats`)
    .then(r => r.json())
    .then(setStats);
}, [selectedCourse]);
```

3. **Remove mock data** from `courseData.ts` (or keep for fallback)

## Routing Examples

### Navigation Patterns

**Same course, different page:**
```
JEE user navigates:
/dashboard/jee → /planner/jee → /practice/jee
```

**Switch course, same page:**
```
User on /practice/jee wants NEET:
Click "NEET" in sidebar → /practice/neet
(Page updates, course changes, but URL path stays /practice)
```

**Deep linking:**
```
User bookmarks: /analytics/upsc
Opens directly to UPSC analytics
```

## Customization Options

### Adding a New Course
1. Add new entry to `courseDataMap` in `utils/courseData.ts`
2. Add course type: `type CourseType = "jee" | "neet" | "upsc" | "newcourse"`
3. Add emoji to `courseEmojis` object
4. Add color scheme to `getCourseColorScheme()` function
5. Sidebar will automatically show new course

### Changing Colors
Edit `getCourseColorScheme()` in `utils/courseData.ts`:
```tsx
jee: {
  bg: "bg-blue-500/10",      // Main background
  border: "border-blue-500/30",
  text: "text-blue-600",     // Primary text
  darkText: "dark:text-blue-400",
  badge: "bg-blue-500/20 text-blue-700",
  button: "hover:bg-blue-500/20",
},
```

### Changing Icons
Edit `courseEmojis` in `utils/courseData.ts`:
```tsx
courseEmojis = {
  jee: "🔬",    // Change emoji here
  neet: "🧬",
  upsc: "⚖️",
};
```

## Performance Considerations

### Optimizations in Place
- Course data is loaded synchronously (small static data)
- Color schemes computed with `getCourseColorScheme()` (lightweight)
- Animations use Framer Motion with GPU acceleration
- Course changes trigger memoized re-renders only

### Future Optimizations
- Lazy load course data for inactive courses
- Cache course stats in localStorage
- Implement course prefetching before navigation
- Suspend API calls during course transitions

## Backward Compatibility

All old routes still work:
- `/dashboard` → Uses `selectedCourse` from context (default: 'jee')
- `/planner` → Uses context course
- etc.

New course-specific routes override context:
- `/dashboard/neet` → Uses 'neet' even if context says 'jee'
- `/planner/upsc` → Uses 'upsc' even if context says 'jee'

**Result:** Smooth migration with no breaking changes.

## Known Limitations & TODOs

### Current Limitations
- [ ] Course data is mock only
- [ ] Switching courses doesn't trigger API data refresh
- [ ] No confirmation dialog when switching courses
- [ ] No course progress sync across devices

### Future Enhancements
- [ ] Persist course selection on backend (per user)
- [ ] Real-time course stats from backend
- [ ] Course-specific notifications
- [ ] Course recommendation system
- [ ] Multi-course enrollment management
- [ ] Course progress history/timeline
- [ ] Export course progress
- [ ] Course comparison tool
- [ ] Adaptive course difficulty selection

## Testing & Debugging

### Test Course Selection
1. Sidebar course selector works: Click each course, verify selection stores
2. Current course indicator updates: Changes on page, shows right course
3. URL persistence: Bookmark `/practice/neet`, reopened URL loads NEET
4. localStorage check: Open DevTools → Application → localStorage → selectedCourse

### Debugging
Check Chrome DevTools:
1. **Context value:** Use React DevTools extension to inspect CourseProvider
2. **Course data:** Console → `import { getCourseData } from '@/utils/courseData'` → `getCourseData('jee')`
3. **Routing:** Check URL parameters in address bar
4. **localStorage:** Application tab → localStorage → verify `selectedCourse` key

## Summary

The course system provides:
✅ Global course management via Context  
✅ Beautiful sidebar course selector with animations  
✅ Dynamic routing with course parameters  
✅ Course-specific data & color schemes  
✅ Smooth transitions between courses  
✅ Backward compatible routing  
✅ Mock data ready for backend integration  
✅ Reusable utilities and hooks  

The system is **production-ready and scalable** for adding more courses, features, and backend integration.
