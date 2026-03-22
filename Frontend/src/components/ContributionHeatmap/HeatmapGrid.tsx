import { useMemo } from "react";
import { format, startOfYear, addDays, getDay } from "date-fns";
import { motion } from "framer-motion";
import HeatmapDay from "./HeatmapDay";
import { getIntensityColor, getMonthLabel } from "./utils";

interface HeatmapGridProps {
  year: number;
  data: Map<string, number>;
  hoveredDate: string | null;
  onDayHover: (date: string | null) => void;
  onDayClick: (date: string) => void;
  animated: boolean;
}

interface Week {
  days: Array<{ date: string; count: number } | null>;
  startDate: Date;
}

export default function HeatmapGrid({
  year,
  data,
  hoveredDate,
  onDayHover,
  onDayClick,
  animated,
}: HeatmapGridProps) {
  // Organize days into weeks
  const weeks = useMemo(() => {
    const firstDay = startOfYear(new Date(year, 0, 1));
    const startDate = new Date(firstDay);
    // Move back to the previous Sunday or Monday
    startDate.setDate(startDate.getDate() - getDay(startDate));

    const weeks: Week[] = [];
    let currentDate = new Date(startDate);

    for (let w = 0; w < 53; w++) {
      const week: Week = {
        days: [],
        startDate: new Date(currentDate),
      };

      for (let d = 0; d < 7; d++) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const yearMatch = new Date(dateStr).getFullYear() === year;

        if (yearMatch) {
          const count = data.get(dateStr) || 0;
          week.days.push({ date: dateStr, count });
        } else {
          week.days.push(null);
        }

        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }

      weeks.push(week);
    }

    return weeks;
  }, [year, data]);

  // Get month labels with positions
  const monthLabels = useMemo(() => {
    const labels: Array<{ month: string; weekIndex: number }> = [];
    let currentMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const month = new Date(week.startDate).getMonth();
      if (month !== currentMonth) {
        labels.push({ month: getMonthLabel(month), weekIndex });
        currentMonth = month;
      }
    });

    return labels;
  }, [weeks]);

  // Day labels (Sun-Sat)
  const dayLabels = ["Mon", "Wed", "Fri"];

  return (
    <motion.div
      className="inline-flex flex-col gap-4"
      initial={animated ? { opacity: 0 } : {}}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.01, delayChildren: 0.1 }}
    >
      {/* Month Labels */}
      <div className="flex gap-0.5 pl-8">
        {monthLabels.map((label, idx) => (
          <div
            key={idx}
            style={{
              width: `${label.weekIndex * 16 + 16}px`,
              paddingLeft: idx === 0 ? "0px" : "0px",
            }}
            className="text-xs font-semibold text-muted-foreground overflow-hidden truncate"
          >
            {idx === 0 ? label.month : label.month}
          </div>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-0.5">
        {/* Day of week labels */}
        <div className="flex flex-col gap-0.5 pr-3 pt-0.5">
          {dayLabels.map((day) => (
            <div
              key={day}
              className="h-3 w-6 text-xs font-medium text-muted-foreground flex items-center justify-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Weeks grid */}
        <div className="flex gap-0.5">
          {weeks.map((week, weekIdx) => (
            <motion.div
              key={weekIdx}
              className="flex flex-col gap-0.5"
              initial={animated ? { opacity: 0, scale: 0.8 } : {}}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: weekIdx * 0.02,
                ease: "easeOut",
              }}
            >
              {week.days.map((dayData, dayIdx) => (
                <HeatmapDay
                  key={`${weekIdx}-${dayIdx}`}
                  date={dayData?.date}
                  count={dayData?.count || 0}
                  isHovered={hoveredDate === dayData?.date}
                  onHover={() => dayData && onDayHover(dayData.date)}
                  onHoverEnd={() => onDayHover(null)}
                  onClick={() => dayData && onDayClick(dayData.date)}
                />
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
