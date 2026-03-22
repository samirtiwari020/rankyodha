import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CourseType = "jee" | "neet" | "upsc";

interface CourseContextType {
  selectedCourse: CourseType;
  setSelectedCourse: (course: CourseType) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [selectedCourse, setSelectedCourseState] = useState<CourseType>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem("selectedCourse");
    return (saved as CourseType) || "jee";
  });

  // Persist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("selectedCourse", selectedCourse);
  }, [selectedCourse]);

  const setSelectedCourse = (course: CourseType) => {
    setSelectedCourseState(course);
  };

  return (
    <CourseContext.Provider value={{ selectedCourse, setSelectedCourse }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  return context;
}
