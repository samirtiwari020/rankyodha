# GitHub-Style Contribution Heatmap - Integration Guide

## Architecture Overview

The contribution heatmap component is organized into modular, reusable pieces:

```
Frontend/src/components/ContributionHeatmap/
├── ContributionHeatmap.tsx      # Main component (orchestrator)
├── HeatmapGrid.tsx               # Grid layout and week rendering
├── HeatmapDay.tsx                # Individual day cell
├── HeatmapTooltip.tsx            # Hover tooltip display
├── HeatmapLegend.tsx             # Color intensity legend
├── utils.ts                      # Utility functions
├── types.ts                      # TypeScript type definitions
├── index.ts                      # Public exports
└── README.md                     # Complete documentation
```

## File Descriptions

### ContributionHeatmap.tsx
**Purpose**: Main component that orchestrates the entire heatmap

**Key Features**:
- Accepts custom data or generates random data
- Manages tooltip and hover state
- Displays header stats (total, active days, max)
- Handles day click callbacks
- Configurable animations and legend

**Usage**:
```tsx
import { ContributionHeatmap } from "@/components/ContributionHeatmap";

<ContributionHeatmap 
  data={data}
  year={2025}
  onDayClick={handleDayClick}
/>
```

### HeatmapGrid.tsx
**Purpose**: Handles grid layout and week-by-week rendering

**Responsibilities**:
- Organizes 365 days into weeks
- Calculates month labels and their positions
- Renders staggered animations for weeks
- Manages day-of-week labels (Mon, Wed, Fri)
- Handles proper date wrapping across month boundaries

### HeatmapDay.tsx
**Purpose**: Individual day cell component

**Features**:
- Renders as a 12px × 12px square by default (easily customizable)
- Hover effects (scale 1.15x)
- Click interactions
- Keyboard accessible (semantic button)
- Tool tips on hover
- Rounded corners

### HeatmapTooltip.tsx
**Purpose**: Floating tooltip that appears on hover

**Shows**:
- Full date (e.g., "Monday, January 15, 2025")
- Contribution count with singular/plural form
- Positioned near mouse cursor
- Smooth fade-in animation

### HeatmapLegend.tsx
**Purpose**: Display color intensity scale

**Contains**:
- 5 color boxes representing intensity levels
- "Less" to "More" labels
- Staggered animation on load
- Hover scaling effects

### utils.ts
**Purpose**: Utility functions for data and color management

**Exports**:
- `generateRandomData(year)` - Creates realistic random contribution data
- `getActivityLevel(count)` - Converts numeric count to level 0-4
- `getIntensityColor(count)` - Returns Tailwind classes for color
- `getMonthLabel(monthIndex)` - Returns month abbreviation
- `calculateStats(data)` - Calculates contribution statistics
- `INTENSITY_LEVELS` - Color level configuration constants

### types.ts
**Purpose**: TypeScript type definitions

**Includes**:
- `ContributionData` - Input data format
- `ContributionHeatmapProps` - Component props
- `ContributionStats` - Statistics interface
- `IntensityLevel` - Color configuration
- All internal component prop types for type safety

### index.ts
**Purpose**: Public API and exports

**Exports**:
- Main component
- All utility functions
- Type definitions

**Usage**:
```tsx
import { 
  ContributionHeatmap, 
  generateRandomData, 
  getActivityLevel 
} from "@/components/ContributionHeatmap";
```

## How It Works

### Data Flow

```
User Input Data (ContributionData[])
           ↓
ContributionHeatmap processes & maps to Date → Count
           ↓
HeatmapGrid organizes into weeks & months
           ↓
HeatmapDay renders individual cells
           ↓
Tooltips & Legend add interactivity
```

### Week Organization Algorithm

```
1. Start from Jan 1 of the given year
2. Back up to the first Monday of that week
3. Create 7-day weeks until end of year
4. Group weeks into months for label placement
5. Render with staggered animations
```

### Color Mapping

```
Count (number) → Activity Level (0-4) → Tailwind Classes
     0         →        0             → gray
     1-2       →        1             → light green
     3-4       →        2             → medium green
     5-6       →        3             → darker green
     7+        →        4             → brightest green
```

## Integration Steps

### Step 1: Add to Your Project
The component is already in:
```
Frontend/src/components/ContributionHeatmap/
```

### Step 2: Import in Your Page
```tsx
import { ContributionHeatmap } from "@/components/ContributionHeatmap";

export default function Analytics() {
  return (
    <ContributionHeatmap 
      year={2025}
      showLegend={true}
      showTooltip={true}
    />
  );
}
```

### Step 3: Add to Routes (Optional)
To add the demo page to your router:

```tsx
// In App.tsx
import ContributionHeatmapDemo from "./pages/ContributionHeatmapDemo";

// In Routes:
<Route path="/heatmap-demo" element={<ContributionHeatmapDemo />} />
```

### Step 4: Use Your Own Data
```tsx
const myData = [
  { date: "2025-01-01", count: 3 },
  { date: "2025-01-02", count: 5 },
  // ... 365 entries
];

<ContributionHeatmap data={myData} year={2025} />
```

## Customization Examples

### Change Cell Size
Edit `HeatmapDay.tsx`:
```tsx
// Small: h-2 w-2
// Default: h-3 w-3
// Large: h-4 w-4
className={`h-4 w-4 rounded-sm...`}
```

### Change Spacing
Edit `HeatmapGrid.tsx`:
```tsx
// Tighter: gap-0.5 md:gap-1
// Default: gap-0.5
// Looser: gap-1 md:gap-2
className="flex gap-1"
```

### Custom Colors
Edit `utils.ts`:
```tsx
export const INTENSITY_LEVELS = [
  { level: 0, label: "No activity", bg: "bg-red-200 dark:bg-red-900" },
  { level: 1, label: "Low", bg: "bg-orange-200 dark:bg-orange-900" },
  // ... custom gradient
];
```

### Add Animation Delay Per Day
In `HeatmapGrid.tsx`, modify `HeatmapDay` rendering:
```tsx
whileInView={{ opacity: 1, scale: 1 }}
transition={{
  delay: (weekIdx * 7 + dayIdx) * 0.02,
  duration: 0.4,
}}
```

## Performance Considerations

### Optimizations Included:
- ✅ Memoized week calculations with `useMemo`
- ✅ Efficient date formatting with `date-fns`
- ✅ Map-based data lookup (O(1) instead of O(n))
- ✅ Staggered animations for smooth rendering
- ✅ CSS transitions instead of JS animations where possible

### For Large Datasets:
```tsx
// Pre-calculate month boundaries
const monthBoundaries = useMemo(() => {
  // calculate only once
}, []);

// Use React.memo for individual cells if data is very large
const MemoizedHeatmapDay = React.memo(HeatmapDay);
```

## Testing Guide

### Unit Test Example (Jest + React Testing Library)
```tsx
import { render, screen } from "@testing-library/react";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";

describe("ContributionHeatmap", () => {
  it("renders with default props", () => {
    render(<ContributionHeatmap />);
    expect(screen.getByText(/Contribution Graph/)).toBeInTheDocument();
  });

  it("displays custom data correctly", () => {
    const data = [{ date: "2025-01-01", count: 5 }];
    render(<ContributionHeatmap data={data} />);
    // Test assertions
  });

  it("shows tooltip on hover", () => {
    render(<ContributionHeatmap showTooltip={true} />);
    // Hover interactions test
  });
});
```

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Grid | ✓ | ✓ | ✓ | ✓ |
| CSS Flexbox | ✓ | ✓ | ✓ | ✓ |
| Framer Motion | ✓ | ✓ | ✓ | ✓ |
| Date-fns | ✓ | ✓ | ✓ | ✓ |
| Dark Mode | ✓ | ✓ | ✓ | ✓ |

## Common Issues & Solutions

### Issue: Grid looks misaligned
**Solution**: Check that container has sufficient width or enable overflow-x-auto

### Issue: Animations not smooth
**Solution**: Verify framer-motion is installed and imported correctly

### Issue: Colors not showing in dark mode
**Solution**: Ensure Tailwind dark mode is enabled in `tailwind.config.ts`

### Issue: Tooltip showing wrong date
**Solution**: Verify dates are in YYYY-MM-DD format exactly

### Issue: Performance lag with many renders
**Solution**: Disable animations with `animated={false}` prop

## Future Enhancement Ideas

- [ ] Add time range selector (3m, 6m, 1y)
- [ ] Add export as image/SVG
- [ ] Add filter by minimum activity level
- [ ] Add multi-year view
- [ ] Add statistics modal/drawer
- [ ] Add keyboard navigation
- [ ] Add drag-to-select date range
- [ ] Add custom color schemes
- [ ] Add data import/export (JSON, CSV)
- [ ] Add timezone handling

## Debugging Tips

### Enable debug logging:
```tsx
<ContributionHeatmap 
  onDayClick={(date, count) => {
    console.log(`Date: ${date}, Count: ${count}`);
  }}
/>
```

### Check data structure:
```tsx
import { generateRandomData } from "@/components/ContributionHeatmap";

const data = generateRandomData(2025);
console.log(Array.from(data.entries()).slice(0, 10));
```

### Verify month labels:
```tsx
import { getMonthLabel } from "@/components/ContributionHeatmap";

[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach(m => {
  console.log(`Month ${m}: ${getMonthLabel(m)}`);
});
```

## Questions & Support

Refer to:
1. **Component Documentation**: `README.md` in the component folder
2. **Type Definitions**: `types.ts` for interface details
3. **Examples**: `pages/ContributionHeatmapDemo.tsx` for usage examples
4. **Utility Functions**: `utils.ts` for data processing helpers
