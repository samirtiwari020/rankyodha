# Quick Start Guide - Contribution Heatmap

Get up and running with the GitHub-style contribution heatmap in 2 minutes.

## Installation ✓ (Already Done!)

All dependencies are already in your project:
- ✅ React 18.3+
- ✅ Tailwind CSS 3.4+
- ✅ Framer Motion 12.38+
- ✅ date-fns 3.6+

## Zero-Config Usage

### Option 1: Show Random Data (Quickest)

```tsx
import { ContributionHeatmap } from "@/components/ContributionHeatmap";

export default function MyPage() {
  return <ContributionHeatmap />;
}
```

That's it! Shows a full year of random data with all features enabled.

### Option 2: Custom Data

```tsx
import { ContributionHeatmap } from "@/components/ContributionHeatmap";

const myData = [
  { date: "2025-01-01", count: 3 },
  { date: "2025-01-02", count: 0 },
  { date: "2025-01-03", count: 5 },
  // ... add more dates (365 total for a full year)
];

export default function MyPage() {
  return (
    <ContributionHeatmap 
      data={myData}
      year={2025}
    />
  );
}
```

### Option 3: With Click Handler

```tsx
import { ContributionHeatmap } from "@/components/ContributionHeatmap";

export default function Analytics() {
  const handleDayClick = (date: string, count: number) => {
    alert(`${date}: ${count} contributions`);
  };

  return (
    <ContributionHeatmap
      year={2025}
      onDayClick={handleDayClick}
    />
  );
}
```

## Live Demo

Visit the demo page to see all examples:

```tsx
// Add this route to your App.tsx:
import ContributionHeatmapDemo from "@/pages/ContributionHeatmapDemo";

<Route path="/heatmap" element={<ContributionHeatmapDemo />} />

// Then visit: http://localhost:5173/heatmap
```

## Key Features

| Feature | Included? | Customizable? |
|---------|-----------|---------------|
| Full year display | ✅ | Yes |
| 5 color intensity levels | ✅ | Yes |
| Hover tooltips | ✅ | Yes (`showTooltip`) |
| Legend | ✅ | Yes (`showLegend`) |
| Animations | ✅ | Yes (`animated`) |
| Responsive design | ✅ | Yes |
| Click callbacks | ✅ | Yes (`onDayClick`) |
| Dark mode support | ✅ | Built-in |
| Random data generator | ✅ | Yes |

## Common Configurations

### Minimal (No Legend, No Animations)
```tsx
<ContributionHeatmap 
  year={2025}
  showLegend={false}
  animated={false}
/>
```

### Full Featured (All Bells & Whistles)
```tsx
<ContributionHeatmap
  data={myData}
  year={2025}
  showLegend={true}
  showTooltip={true}
  animated={true}
  onDayClick={(date, count) => console.log(date, count)}
  containerClassName="max-w-6xl"
/>
```

### Study Tracker Style
```tsx
<ContributionHeatmap
  data={studyData}
  year={2025}
  showLegend={true}
  showTooltip={true}
  animated={true}
  onDayClick={handleStudyDayClick}
  containerClassName="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-6"
/>
```

## Data Format

Each entry must be an object with:
- `date` (string): YYYY-MM-DD format
- `count` (number): 0-4 representing activity level

```tsx
const data = [
  { date: "2025-01-01", count: 0 }, // No activity
  { date: "2025-01-02", count: 1 }, // Low activity
  { date: "2025-01-03", count: 2 }, // Medium activity
  { date: "2025-01-04", count: 3 }, // High activity
  { date: "2025-01-05", count: 4 }, // Very high activity
];
```

## Generate Data from Arrays

```tsx
import { generateRandomData } from "@/components/ContributionHeatmap";

// Auto-generate for 2025
const data = Array.from(generateRandomData(2025).entries())
  .map(([date, count]) => ({ date, count }));

<ContributionHeatmap data={data} year={2025} />
```

## Styling & Customization

### Change Container Width
```tsx
<ContributionHeatmap 
  containerClassName="w-full max-w-7xl mx-auto"
/>
```

### Add Border & Background
```tsx
<ContributionHeatmap 
  containerClassName="border border-cyan-500/30 rounded-lg bg-card p-6"
/>
```

### Full Page Layout
```tsx
import { ContributionHeatmap } from "@/components/ContributionHeatmap";

export default function Page() {
  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-black">My Contributions</h1>
        <p className="text-muted-foreground">Track your progress</p>
      </div>
      
      <ContributionHeatmap 
        year={2025}
        animated={true}
        showLegend={true}
      />
    </div>
  );
}
```

## Tips & Tricks

### 1. Prefill Data from Backend
```tsx
const [data, setData] = useState([]);

useEffect(() => {
  fetch('/api/contributions')
    .then(res => res.json())
    .then(setData);
}, []);

<ContributionHeatmap data={data} />
```

### 2. Create Weekly Pattern
```tsx
const weeklyData = Array.from({ length: 365 }).map((_, i) => {
  const date = new Date(2025, 0, 1 + i);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  return {
    date: date.toISOString().split('T')[0],
    count: isWeekend ? 1 : 3,
  };
});

<ContributionHeatmap data={weeklyData} />
```

### 3. Create Streak Pattern
```tsx
const streakData = Array.from({ length: 365 }).map((_, i) => ({
  date: new Date(2025, 0, 1 + i).toISOString().split('T')[0],
  count: Math.min(i, 4), // Gradually increases to 4
}));

<ContributionHeatmap data={streakData} />
```

### 4. Export Data to CSV
```tsx
const exportData = () => {
  const csv = data
    .map(d => `${d.date},${d.count}`)
    .join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'contributions.csv';
  a.click();
};
```

## Troubleshooting

### "Module not found" error?
→ Make sure all component files are in: `Frontend/src/components/ContributionHeatmap/`

### Dates not showing in tooltip?
→ Use YYYY-MM-DD format exactly: `"2025-01-15"` ✓, `"01/15/2025"` ✗

### Colors not visible in dark mode?
→ Tailwind dark mode should be enabled automatically

### Grid doesn't scroll?
→ Add width constraint: `containerClassName="max-w-4xl"`

## Need More Help?

- **Full Documentation**: See `README.md` in the component folder
- **Integration Guide**: See `INTEGRATION.md` for advanced setup
- **Type Definitions**: See `types.ts` for all interfaces
- **Demo Page**: Visit `/heatmap` (if route added) to see live examples
- **Code Examples**: Check `pages/ContributionHeatmapDemo.tsx`

## What's Included

✅ Main component  
✅ 5 sub-components (Grid, Day, Tooltip, Legend, etc.)  
✅ 10+ utility functions  
✅ Complete TypeScript types  
✅ Animations with Framer Motion  
✅ Dark mode support  
✅ Responsive design  
✅ Full documentation  
✅ Demo page with 3+ examples  
✅ Integration guide  

## Next Steps

1. **Try it**: Add `<ContributionHeatmap />` to any page
2. **Customize**: Add your data with the `data` prop
3. **Explore**: Check the demo page at `/heatmap-demo`
4. **Extend**: Read INTEGRATION.md for advanced features

Enjoy! 🎉
