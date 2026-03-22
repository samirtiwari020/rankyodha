# GitHub-Style Contribution Heatmap Component

A production-quality React component that displays a GitHub-style contribution heatmap. Perfect for displaying activity data, study streaks, or any daily metric over a full year.

## Features

✅ **Full Year Display** - Complete 12-month calendar grid  
✅ **5 Intensity Levels** - Color-coded activity from no activity to very high  
✅ **Interactive Tooltips** - Hover to see date and contribution count  
✅ **Animations** - Smooth fade-in and scale animations  
✅ **Responsive Design** - Works on mobile, tablet, and desktop  
✅ **Keyboard Accessible** - Proper ARIA labels and semantic HTML  
✅ **Dark Mode Support** - Tailwind dark mode compatible  
✅ **Flexible Data** - Accepts custom data or generates random data  
✅ **Modular Code** - Well-organized, reusable components  

## Installation

The component uses:
- **React** (18.3+)
- **date-fns** (3.6.0+) - Already in your dependencies
- **framer-motion** (12.38.0+) - Already in your dependencies
- **Tailwind CSS** (3.4.17+) - Already in your dependencies

All dependencies are already included in your project!

## Usage

### Basic Example

```tsx
import { ContributionHeatmap } from "@/components/ContributionHeatmap";

export default function App() {
  return <ContributionHeatmap />;
}
```

### With Custom Data

```tsx
import { ContributionHeatmap } from "@/components/ContributionHeatmap";

const data = [
  { date: "2025-01-01", count: 3 },
  { date: "2025-01-02", count: 5 },
  // ... more entries
];

export default function App() {
  return (
    <ContributionHeatmap 
      data={data}
      year={2025}
    />
  );
}
```

### With All Options

```tsx
import { ContributionHeatmap } from "@/components/ContributionHeatmap";

export default function App() {
  return (
    <ContributionHeatmap
      data={data}
      year={2025}
      showLegend={true}
      showTooltip={true}
      animated={true}
      onDayClick={(date, count) => {
        console.log(`${date}: ${count} contributions`);
      }}
      containerClassName="max-w-7xl mx-auto"
    />
  );
}
```

## Props

```tsx
interface ContributionHeatmapProps {
  // Custom contribution data (optional)
  // If not provided, random data is generated
  data?: ContributionData[];

  // Year to display (default: current year)
  year?: number;

  // Show color intensity legend (default: true)
  showLegend?: boolean;

  // Show hover tooltip (default: true)
  showTooltip?: boolean;

  // Callback when a day cell is clicked
  onDayClick?: (date: string, count: number) => void;

  // Enable fade-in and scale animations (default: true)
  animated?: boolean;

  // Additional CSS classes for the container
  containerClassName?: string;
}

interface ContributionData {
  date: string;  // YYYY-MM-DD format
  count: number; // 0-4 (activity level)
}
```

## Data Format

Each entry in the `data` array should follow this format:

```tsx
{
  date: "2025-01-15",  // YYYY-MM-DD format (required)
  count: 3              // 0-4 activity level (required)
}
```

### Activity Levels

- **0** - No activity (dark gray)
- **1** - Low activity (light green)
- **2** - Medium activity (medium green)
- **3** - High activity (darker green)
- **4** - Very high activity (brightest green)

## Color Scheme

The component uses a green color gradient similar to GitHub:

| Level | Light Mode | Dark Mode |
|-------|-----------|-----------|
| 0 (None) | `bg-slate-200` | `bg-slate-800` |
| 1 (Low) | `bg-green-200` | `bg-green-900` |
| 2 (Medium) | `bg-green-400` | `bg-green-700` |
| 3 (High) | `bg-green-600` | `bg-green-600` |
| 4 (Very High) | `bg-green-800` | `bg-green-500` |

## Component Structure

```
ContributionHeatmap/
├── ContributionHeatmap.tsx    # Main component
├── HeatmapGrid.tsx            # Grid layout logic
├── HeatmapDay.tsx             # Individual day cell
├── HeatmapTooltip.tsx         # Hover tooltip
├── HeatmapLegend.tsx          # Color legend
├── utils.ts                   # Utility functions
└── index.ts                   # Exports
```

## Utilities

### generateRandomData(year)
Generates realistic random contribution data for a full year.

```tsx
import { generateRandomData } from "@/components/ContributionHeatmap";

const data = generateRandomData(2025);
// Returns: Map<string, number> with dates and counts
```

### getActivityLevel(count)
Converts a count to an activity level (0-4).

```tsx
import { getActivityLevel } from "@/components/ContributionHeatmap";

const level = getActivityLevel(5); // Returns: 3
```

### getIntensityColor(count)
Returns Tailwind color classes for a given count.

```tsx
import { getIntensityColor } from "@/components/ContributionHeatmap";

const { bg, hover } = getIntensityColor(3);
// bg: "bg-green-600 dark:bg-green-600"
// hover: "brightness-110"
```

### calculateStats(data)
Calculates statistics from contribution data.

```tsx
import { calculateStats } from "@/components/ContributionHeatmap";

const stats = calculateStats(data);
// Returns: { total, maxDay, activeDays, totalDays }
```

## Responsive Behavior

- **Mobile** (< 768px): Grid is scrollable horizontally with optimized spacing
- **Tablet** (768px - 1024px): Grid scales appropriately
- **Desktop** (> 1024px): Full grid displayed with comfortable spacing

## Animations

The component includes:
- **Load animation**: Fade-in with scale effect
- **Week stagger**: Progressive reveal of weeks left to right
- **Day animation**: Individual cell fade-in
- **Hover effect**: Scale and brightness increase on hover
- **Tooltip animation**: Smooth fade-in/out

Disable animations with `animated={false}` prop if needed.

## Accessibility

- ✅ Proper ARIA labels on each day cell
- ✅ Keyboard navigable (buttons are clickable)
- ✅ Semantic HTML structure
- ✅ Sufficient color contrast for WCAG compliance
- ✅ Tooltip shows full information for screen readers

## Performance

The component is optimized for performance:
- Uses `useMemo` for expensive calculations
- Efficient week-based rendering
- Smooth CSS transitions and animations
- No external dependencies beyond React ecosystem

## Customization

### Change Colors

Edit `INTENSITY_LEVELS` in `utils.ts`:

```tsx
export const INTENSITY_LEVELS = [
  { level: 0, label: "No activity", bg: "bg-YOUR-COLOR" },
  // ... more levels
];
```

### Adjust Grid Size

Modify the grid dimensions in `HeatmapDay.tsx`:

```tsx
// Change: h-3 w-3 to h-4 w-4 for larger cells
className={`h-4 w-4 rounded-sm...`}
```

### Change Spacing

Modify gap values in `HeatmapGrid.tsx`:

```tsx
// Change: gap-0.5 to gap-1 for more space
className="flex gap-1"
```

## Demo Page

A complete demo page is available at `pages/ContributionHeatmapDemo.tsx` showing:
- Auto-generated random data
- Custom data patterns
- Minimal configuration
- Usage examples

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT - feel free to use and modify in your projects!

## Troubleshooting

### Data not showing?
- Ensure dates are in YYYY-MM-DD format
- Check that count values are between 0-4
- Verify the year prop matches your data

### Grid looks narrow?
- The grid scrolls horizontally if container is too small
- Increase container width or use responsive design
- Check that `overflow-x-auto` is applied

### Animations not smooth?
- Ensure framer-motion is properly installed
- Check that motion components are imported correctly
- Disable animations temporarily with `animated={false}`

## Examples

See `pages/ContributionHeatmapDemo.tsx` for live examples and usage patterns.
