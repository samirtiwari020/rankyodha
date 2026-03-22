import { useMemo, useState } from "react";
import { format, startOfYear, addDays, getMonth, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import HeatmapGrid from "./HeatmapGrid";
import HeatmapLegend from "./HeatmapLegend";
import HeatmapTooltip from "./HeatmapTooltip";
import { generateRandomData, getActivityLevel, INTENSITY_LEVELS } from "./utils";

export interface ContributionData {
  date: string; // YYYY-MM-DD format
  count: number; // 0-4 (activity level)
}

export interface ContributionHeatmapProps {
  data?: ContributionData[];
  year?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  onDayClick?: (date: string, count: number) => void;
  animated?: boolean;
  containerClassName?: string;
}

export default function ContributionHeatmap({
  data,
  year = new Date().getFullYear(),
  showLegend = true,
  showTooltip = true,
  onDayClick,
  animated = true,
  containerClassName = "",
}: ContributionHeatmapProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Generate or use provided data
  const heatmapData = useMemo(() => {
    if (data && data.length > 0) {
      const dataMap = new Map(data.map((d) => [d.date, d.count]));
      return dataMap;
    }
    return generateRandomData(year);
  }, [data, year]);

  // Calculate stats
  const stats = useMemo(() => {
    let total = 0;
    let maxDay = 0;
    let activeDays = 0;

    heatmapData.forEach((count) => {
      total += count;
      if (count > maxDay) maxDay = count;
      if (count > 0) activeDays += 1;
    });

    return { total, maxDay, activeDays };
  }, [heatmapData]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleDayClick = (date: string) => {
    const count = heatmapData.get(date) || 0;
    onDayClick?.(date, count);
  };

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 10 } : {}}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`w-full space-y-6 ${containerClassName}`}
    >
      {/* Header with stats */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black">Contribution Graph</h2>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{stats.total}</span>{" "}
            contributions
          </span>
          <span>
            <span className="font-semibold text-foreground">{stats.activeDays}</span> active
            days
          </span>
          <span>
            <span className="font-semibold text-foreground">{stats.maxDay}</span> max in a day
          </span>
        </div>
      </div>

      {/* Heatmap Container */}
      <div
        className="relative w-full overflow-x-auto rounded-lg border border-border/50 bg-card p-4 md:p-6"
        onMouseMove={handleMouseMove}
      >
        <HeatmapGrid
          year={year}
          data={heatmapData}
          hoveredDate={hoveredDate}
          onDayHover={setHoveredDate}
          onDayClick={handleDayClick}
          animated={animated}
        />

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && hoveredDate && (
            <HeatmapTooltip
              date={hoveredDate}
              count={heatmapData.get(hoveredDate) || 0}
              position={tooltipPosition}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      {showLegend && <HeatmapLegend />}
    </motion.div>
  );
}
