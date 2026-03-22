# Quick Integration Guide - Adding Course Support to Pages

## 5-Minute Checklist

Add course support to any page in 5 simple steps:

### Step 1: Import Hook
```tsx
import { useCourse } from "@/contexts/CourseContext";
import { getCourseData, getCourseColorScheme } from "@/utils/courseData";
```

### Step 2: Get Course in Component
```tsx
export default function MyPage() {
  const { selectedCourse } = useCourse();
  const courseData = getCourseData(selectedCourse);
  const courseColors = getCourseColorScheme(selectedCourse);
  
  // ... rest of component
}
```

### Step 3: Update Title/Header
**Before:**
```tsx
<h1>Study Planner</h1>
```

**After:**
```tsx
<h1>{courseData.name} - Study Planner</h1>
```

### Step 4: Apply Course Colors
**Before:**
```tsx
<div className="bg-cyan-500/10 border-cyan-500/30 text-cyan-600">
  Content
</div>
```

**After:**
```tsx
<div className={`${courseColors.bg} ${courseColors.border} ${courseColors.text}`}>
  Content
</div>
```

### Step 5: Update Links to Course Routes
**Before:**
```tsx
<Link to="/practice">Start</Link>
<Link to="/revision">Review</Link>
```

**After:**
```tsx
<Link to={`/practice/${selectedCourse}`}>Start</Link>
<Link to={`/revision/${selectedCourse}`}>Review</Link>
```

---

## Complete Example

### Practice Page

**Before (original):**
```tsx
import { useState } from "react";

export default function Practice() {
  const [questions, setQuestions] = useState([]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1>Practice Questions</h1>
      <div className="bg-blue-500/10 border-blue-500/30 text-blue-600 p-4 rounded">
        Practice mode active
      </div>
      <div>Questions: {questions.length}</div>
      <a href="/revision">Review Later</a>
    </div>
  );
}
```

**After (with course support):**
```tsx
import { useState } from "react";
import { useCourse } from "@/contexts/CourseContext";
import { getCourseData, getCourseColorScheme } from "@/utils/courseData";
import { Link } from "react-router-dom";

export default function Practice() {
  const { selectedCourse } = useCourse();
  const courseData = getCourseData(selectedCourse);
  const courseColors = getCourseColorScheme(selectedCourse);
  
  const [questions, setQuestions] = useState([]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1>{courseData.name} - Practice Questions</h1>
      
      <div className={`${courseColors.bg} ${courseColors.border} ${courseColors.text} p-4 rounded border`}>
        Practice mode active - {courseData.description}
      </div>
      
      <div>
        <p>Total Questions: {questions.length}</p>
        <p>Subjects: {courseData.subjects.join(", ")}</p>
      </div>
      
      <Link to={`/revision/${selectedCourse}`}>Review Later</Link>
    </div>
  );
}
```

**Difference: +8 lines of code, +2 imports, full course awareness**

---

## Real-World Examples

### Example 1: Analytics Page
```tsx
// Show course-specific analytics
export default function Analytics() {
  const { selectedCourse } = useCourse();
  const courseData = getCourseData(selectedCourse);
  
  return (
    <>
      <h1>{courseData.name} - Analytics Dashboard</h1>
      <p>Accuracy: {courseData.accuracy}%</p>
      <p>Completion: {courseData.completionPercentage}%</p>
      <p>Study Streak: {courseData.studyStreak} days 🔥</p>
    </>
  );
}
```

### Example 2: Study Planner
```tsx
// Show course-specific subjects
export default function StudyPlanner() {
  const { selectedCourse } = useCourse();
  const courseData = getCourseData(selectedCourse);
  
  return (
    <>
      <h1>Plan: {courseData.name}</h1>
      <h3>Subjects to Cover:</h3>
      <ul>
        {courseData.subjects.map(subject => (
          <li key={subject}>{subject}</li>
        ))}
      </ul>
    </>
  );
}
```

### Example 3: Revision with Course Data
```tsx
// Show revision load per course
export default function Revision() {
  const { selectedCourse } = useCourse();
  const courseData = getCourseData(selectedCourse);
  
  return (
    <>
      <h1>Revision: {courseData.name}</h1>
      <p>Last studied: {courseData.lastStudied}</p>
      <p>Total hours: {courseData.totalHours}h</p>
      <p>Strengths: {courseData.strengths.join(", ")}</p>
      <p>Needs work: {courseData.weaknesses.join(", ")}</p>
    </>
  );
}
```

---

## Common Patterns

### Pattern 1: Show Course-Specific Stats
```tsx
const { selectedCourse } = useCourse();
const courseData = getCourseData(selectedCourse);

const stats = [
  { label: "Accuracy", value: courseData.accuracy },
  { label: "Completion", value: courseData.completionPercentage },
  { label: "Streak", value: courseData.studyStreak },
];

stats.map(stat => <div key={stat.label}>{stat.label}: {stat.value}</div>)
```

### Pattern 2: Conditional Rendering by Course
```tsx
const { selectedCourse } = useCourse();

if (selectedCourse === 'jee') {
  return <JEESpecificContent />;
} else if (selectedCourse === 'neet') {
  return <NEETSpecificContent />;
}
```

### Pattern 3: Dynamic Subject List
```tsx
const courseData = getCourseData(selectedCourse);

courseData.subjects.map(subject => (
  <button key={subject}>{subject}</button>
))
```

### Pattern 4: Course-Branded Sections
```tsx
const courseColors = getCourseColorScheme(selectedCourse);

<section className={`rounded-lg border p-4 ${courseColors.bg} ${courseColors.border}`}>
  Branded section
</section>
```

---

## API for Each Utility

### `useCourse()` Hook
```tsx
const { selectedCourse, setSelectedCourse } = useCourse();

// selectedCourse: 'jee' | 'neet' | 'upsc'
// setSelectedCourse: (course) => void
```

### `getCourseData(course)`
```tsx
const data = getCourseData('jee');

// Returns:
{
  name: string;              // "JEE Main & Advanced"
  acronym: string;           // "JEE"
  icon: string;              // "⚛️"
  color: string;
  description: string;
  subjects: string[];        // ["Physics", "Chemistry", "Math"]
  totalTopics: number;
  accuracy: number;          // 75
  strengths: string[];
  weaknesses: string[];
  lastStudied: string;
  totalHours: number;
  completionPercentage: number;
  studyStreak: number;
  nextMilestone: string;
}
```

### `getCourseColorScheme(course)`
```tsx
const colors = getCourseColorScheme('jee');

// Returns:
{
  bg: string;                // "bg-blue-500/10"
  border: string;            // "border-blue-500/30"
  text: string;              // "text-blue-600"
  darkText: string;          // "dark:text-blue-400"
  badge: string;             // "bg-blue-500/20 text-blue-700"
  button: string;            // "hover:bg-blue-500/20"
}
```

### `getMockCourseStats(course)`
```tsx
const stats = getMockCourseStats('jee');

// Returns:
{
  todayProgress: number;
  weekProgress: number;
  subjectProgress: Array<{
    name: string;
    progress: number;
    accuracy: number;
  }>;
  recentTopics: Array<{
    name: string;
    status: string;
    accuracy: number;
  }>;
}
```

---

## Copy-Paste Templates

### Template 1: Minimal Course Support
```tsx
import { useCourse } from "@/contexts/CourseContext";
import { getCourseData } from "@/utils/courseData";

export default function Page() {
  const { selectedCourse } = useCourse();
  const courseData = getCourseData(selectedCourse);
  
  return (
    <div>
      <h1>{courseData.name}</h1>
      {/* Content */}
    </div>
  );
}
```

### Template 2: Full Course Support with Colors
```tsx
import { useCourse } from "@/contexts/CourseContext";
import { getCourseData, getCourseColorScheme } from "@/utils/courseData";
import { Link } from "react-router-dom";

export default function Page() {
  const { selectedCourse } = useCourse();
  const courseData = getCourseData(selectedCourse);
  const colors = getCourseColorScheme(selectedCourse);
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1>{courseData.name} - Page Title</h1>
      
      <div className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
        {courseData.description}
      </div>
      
      <div>
        <h2>Subjects</h2>
        <ul>
          {courseData.subjects.map(s => <li key={s}>{s}</li>)}
        </ul>
      </div>
      
      <Link to={`/next-page/${selectedCourse}`}>Continue</Link>
    </div>
  );
}
```

---

## Testing Your Changes

After updating a page, test:

```tsx
// Test 1: Verify course data loads
console.log(courseData);

// Test 2: Verify colors are applied
<div className={courseColors.bg}>Check bg color</div>

// Test 3: Verify links work
<Link to={`/page/${selectedCourse}`}>Test link</Link>

// Test 4: Switch course and verify component re-renders
// Click a different course in sidebar, page should update
```

---

## Pages Ready to Update (Optional)

Priority order for most impact:
1. ✅ **Dashboard.tsx** - DONE
2. **StudyPlanner.tsx** - Shows subjects, topics per course
3. **Practice.tsx** - Shows practice questions per course
4. **Analytics.tsx** - Shows course-specific metrics
5. **Revision.tsx** - Shows revision load per course
6. **AISolver.tsx** - Shows doubt resolution per course

---

## Summary

**To add course support:**
1. Import `useCourse()` and `getCourseData()`
2. Call `const { selectedCourse } = useCourse()`
3. Get course data: `getCourseData(selectedCourse)`
4. Use data in UI labels, colors, and links
5. That's it! Page now supports all 3 courses

**Lines of code added per page:** ~5-10 lines  
**Time to implement per page:** ~3-5 minutes  
**Benefit:** Full course awareness across dashboard

