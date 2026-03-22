import { useCourse } from "@/contexts/CourseContext";
import { courseDataMap, courseEmojis } from "@/utils/courseData";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function CourseSelectorPanel() {
  const { selectedCourse, setSelectedCourse } = useCourse();
  const courses = Object.entries(courseDataMap).map(([key, data]) => ({
    id: key as keyof typeof courseDataMap,
    ...data,
  }));

  return (
    <div className="space-y-2 px-2 py-4 border-t border-border">
      <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        My Courses
      </h3>

      <div className="space-y-2">
        {courses.map((course) => {
          const isActive = selectedCourse === course.id;
          const emoji = courseEmojis[course.id as keyof typeof courseEmojis];

          return (
            <motion.button
              key={course.id}
              onClick={() => setSelectedCourse(course.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200",
                "text-sm font-medium flex items-center gap-2",
                isActive
                  ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30"
                  : "text-foreground/80 hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="course-indicator"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-lime-500/10 -z-10"
                  transition={{ type: "spring", duration: 0.3 }}
                />
              )}

              {/* Icon */}
              <span className="text-lg flex-shrink-0">{emoji}</span>

              {/* Name */}
              <span className="flex-1 truncate">{course.acronym}</span>

              {/* Active badge */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Add Course Button (UI Only) */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full text-left px-3 py-2 rounded-lg transition-all duration-200",
          "text-xs font-medium text-muted-foreground hover:text-foreground",
          "hover:bg-secondary/50 flex items-center gap-2 mt-2"
        )}
      >
        <span className="text-sm">➕</span>
        <span>Enroll in Course</span>
      </motion.button>
    </div>
  );
}
