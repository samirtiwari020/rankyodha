import { motion } from "framer-motion";
import { format, parse } from "date-fns";

interface HeatmapTooltipProps {
  date: string;
  count: number;
  position: { x: number; y: number };
}

export default function HeatmapTooltip({ date, count, position }: HeatmapTooltipProps) {
  const dateObj = parse(date, "yyyy-MM-dd", new Date());
  const displayDate = format(dateObj, "EEEE, MMMM d, yyyy");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ duration: 0.15 }}
      className="pointer-events-none fixed z-50 rounded-lg border border-border/50 bg-popover px-3 py-2 text-sm shadow-lg"
      style={{
        left: `${position.x + 12}px`,
        top: `${position.y - 40}px`,
      }}
    >
      <p className="font-semibold text-foreground">{displayDate}</p>
      <p className="text-xs text-muted-foreground">
        {count} {count === 1 ? "contribution" : "contributions"}
      </p>
    </motion.div>
  );
}
