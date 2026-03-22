import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourse, type CourseType } from "@/contexts/CourseContext";

/**
 * Hook to handle course parameter from URL
 * Automatically syncs URL params with CourseContext
 * 
 * Usage in a page:
 * const { course } = useCourseFromParams();
 */
export function useCourseFromParams() {
  const params = useParams<{ course?: CourseType }>();
  const { selectedCourse, setSelectedCourse } = useCourse();
  const navigate = useNavigate();

  useEffect(() => {
    // If course param exists in URL, set it as selected
    if (params.course && ["jee", "neet", "upsc"].includes(params.course)) {
      setSelectedCourse(params.course as CourseType);
    }
  }, [params.course, setSelectedCourse]);

  return {
    course: params.course || selectedCourse,
  };
}

/**
 * Hook to navigate to a different course
 * Maintains current page but changes course
 * 
 * Usage:
 * const navigateToCourse = useCourseNavigation();
 * navigateToCourse('neet'); // Goes to /planner/neet if on /planner
 */
export function useCourseNavigation() {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  return (course: CourseType) => {
    // Remove old course param and add new one
    const pathWithoutCourse = currentPath
      .replace(/\/(jee|neet|upsc)$/, "")
      .replace(/\/(jee|neet|upsc)\//, "/");

    const newPath = pathWithoutCourse.endsWith("/")
      ? `${pathWithoutCourse}${course}`
      : `${pathWithoutCourse}/${course}`;

    navigate(newPath);
  };
}

/**
 * Hook to get current course with fallback to context
 * Useful for pages that support both /dashboard and /dashboard/:course
 */
export function useCourseOrParam() {
  const { selectedCourse } = useCourse();
  const params = useParams<{ course?: CourseType }>();

  return params.course || selectedCourse;
}
