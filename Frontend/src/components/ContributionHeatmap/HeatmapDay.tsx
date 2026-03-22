import { motion } from "framer-motion";
import { format, parse } from "date-fns";
import { getIntensityColor } from "./utils";

interface HeatmapDayProps {
  date?: string;
  count: number;
  isHovered: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
}

export default function HeatmapDay({
  date,
  count,
  isHovered,
  onHover,
  onHoverEnd,
  onClick,
}: HeatmapDayProps) {
  if (!date) {
    return <div className="h-3 w-3 rounded-sm" />;
  }

  const { bg, hover } = getIntensityColor(count);
  const dateObj = parse(date, "yyyy-MM-dd", new Date());
  const displayDate = format(dateObj, "MMM d, yyyy");

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={onHover}
      onHoverEnd={onHoverEnd}
      className={`h-3 w-3 rounded-sm transition-all duration-200 cursor-pointer ${bg} ${
        isHovered ? `${hover} ring-2 ring-offset-2 ring-foreground/30` : ""
      }`}
      title={`${displayDate}: ${count} contributions`}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`${displayDate}: ${count} contributions`}
    />
  );
}
