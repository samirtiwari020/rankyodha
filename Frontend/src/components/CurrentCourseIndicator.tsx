import { useCourse } from "@/contexts/CourseContext";
import { getCourseData } from "@/utils/courseData";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function CurrentCourseIndicator() {
  const { selectedCourse } = useCourse();
  const courseData = getCourseData(selectedCourse);

  const colorMap = {
    jee: "from-blue-500 to-blue-600",
    neet: "from-emerald-500 to-emerald-600",
    upsc: "from-purple-500 to-purple-600",
  };

  return (
    <motion.div
      key={selectedCourse}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-gradient-to-r px-4 py-2 rounded-lg text-white text-sm font-medium",
        "flex items-center justify-center gap-2",
        "shadow-lg",
        colorMap[selectedCourse]
      )}
    >
      <span className="text-lg">{courseData.icon}</span>
      <span>Currently studying: <strong>{courseData.name}</strong></span>
      <span>🔥</span>
    </motion.div>
  );
}
