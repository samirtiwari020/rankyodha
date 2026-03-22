import { ContributionHeatmap, generateRandomData } from "@/components/ContributionHeatmap";
import { useMemo } from "react";

export default function ContributionHeatmapDemo() {
  // Example 1: Using auto-generated random data
  const randomData = useMemo(() => {
    const dataMap = generateRandomData(2025);
    return Array.from(dataMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }, []);

  // Example 2: Using custom data
  const customData = useMemo(() => {
    const data = [];
    const startDate = new Date(2025, 0, 1);
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      // Pattern: higher activity on weekdays
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const count = isWeekend ? Math.random() * 2 : Math.random() * 4;
      data.push({ date: dateStr, count: Math.floor(count) });
    }
    return data;
  }, []);

  return (
    <div className="space-y-16 p-8">
      {/* Example 1: Auto-generated random data */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">GitHub-Style Contribution Heatmap</h2>
          <p className="text-muted-foreground">Example 1: Auto-generated random data</p>
        </div>
        <ContributionHeatmap
          data={randomData}
          year={2025}
          showLegend={true}
          showTooltip={true}
          animated={true}
          onDayClick={(date, count) => {
            console.log(`Clicked ${date}: ${count} contributions`);
          }}
        />
      </div>

      {/* Example 2: Custom data pattern */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Custom Data Pattern</h2>
          <p className="text-muted-foreground">
            Example 2: Higher activity on weekdays, lower on weekends
          </p>
        </div>
        <ContributionHeatmap
          data={customData}
          year={2025}
          showLegend={true}
          showTooltip={true}
          animated={true}
        />
      </div>

      {/* Example 3: Minimal style */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Minimal Style</h2>
          <p className="text-muted-foreground">Example 3: Without legend and with animation disabled</p>
        </div>
        <ContributionHeatmap
          data={randomData}
          year={2025}
          showLegend={false}
          showTooltip={true}
          animated={false}
        />
      </div>

      {/* Usage Instructions */}
      <div className="space-y-4 rounded-lg border border-border/50 bg-card/50 p-6">
        <h3 className="text-lg font-semibold">Usage Instructions</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Import:</strong> <code className="text-xs bg-muted px-2 py-1 rounded">
              import {"{ ContributionHeatmap }"} from "@/components/ContributionHeatmap"
            </code>
          </p>

          <p>
            <strong>Props:</strong>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li>
                <code className="text-xs bg-muted px-1">data</code> - Array of{" "}
                <code className="text-xs bg-muted px-1">{"{ date, count }"}</code> objects (optional)
              </li>
              <li>
                <code className="text-xs bg-muted px-1">year</code> - Year to display (default: current year)
              </li>
              <li>
                <code className="text-xs bg-muted px-1">showLegend</code> - Show intensity legend (default: true)
              </li>
              <li>
                <code className="text-xs bg-muted px-1">showTooltip</code> - Show hover tooltip (default: true)
              </li>
              <li>
                <code className="text-xs bg-muted px-1">onDayClick</code> - Callback when day is clicked
              </li>
              <li>
                <code className="text-xs bg-muted px-1">animated</code> - Enable animations (default: true)
              </li>
            </ul>
          </p>

          <p>
            <strong>Data Format:</strong> Each entry in the data array should have:
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li>
                <code className="text-xs bg-muted px-1">date</code> - YYYY-MM-DD format string
              </li>
              <li>
                <code className="text-xs bg-muted px-1">count</code> - Number 0-4 (activity level)
              </li>
            </ul>
          </p>
        </div>
      </div>
    </div>
  );
}
