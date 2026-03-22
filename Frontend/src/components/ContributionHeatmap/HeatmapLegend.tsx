import { motion } from "framer-motion";
import { INTENSITY_LEVELS } from "./utils";

export default function HeatmapLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex items-center gap-4 text-sm"
    >
      <span className="font-semibold text-foreground">Less</span>
      <div className="flex gap-2">
        {INTENSITY_LEVELS.map((level, idx) => (
          <motion.div
            key={idx}
            className={`h-3 w-3 rounded-sm ${level.bg}`}
            title={level.label}
            whileHover={{ scale: 1.2 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 + 0.3 }}
          />
        ))}
      </div>
      <span className="font-semibold text-foreground">More</span>
    </motion.div>
  );
}
