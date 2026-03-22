import { CourseType } from "@/contexts/CourseContext";

export interface CourseData {
  name: string;
  acronym: string;
  icon: string;
  color: "emerald" | "blue" | "purple" | "orange";
  description: string;
  subjects: string[];
  totalTopics: number;
  accuracy: number;
  strengths: string[];
  weaknesses: string[];
  lastStudied: string;
  totalHours: number;
  completionPercentage: number;
  studyStreak: number;
  nextMilestone: string;
}

export const courseDataMap: Record<CourseType, CourseData> = {
  jee: {
    name: "JEE Main & Advanced",
    acronym: "JEE",
    icon: "⚛️",
    color: "blue",
    description: "Master Physics, Chemistry & Mathematics for IIT entrance",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    totalTopics: 156,
    accuracy: 75,
    strengths: ["Calculus", "Organic Chemistry", "Electromagnetism"],
    weaknesses: ["Inorganic Chemistry", "Modern Physics"],
    lastStudied: "2 hours ago",
    totalHours: 287,
    completionPercentage: 68,
    studyStreak: 15,
    nextMilestone: "Complete JEE Physics Unit 5 - 45% done",
  },
  neet: {
    name: "NEET",
    acronym: "NEET",
    icon: "🔬",
    color: "emerald",
    description: "Prepare for NEET with comprehensive Biology, Chemistry & Physics",
    subjects: ["Physics", "Chemistry", "Biology"],
    totalTopics: 189,
    accuracy: 68,
    strengths: ["Zoology", "Botany Taxonomy"],
    weaknesses: ["Physical Chemistry", "Thermodynamics"],
    lastStudied: "5 days ago",
    totalHours: 145,
    completionPercentage: 42,
    studyStreak: 3,
    nextMilestone: "Start Human Physiology - 0% done",
  },
  upsc: {
    name: "UPSC Civil Services",
    acronym: "UPSC",
    icon: "⚖️",
    color: "purple",
    description: "Comprehensive preparation for UPSC CSE examination",
    subjects: ["History", "Geography", "Polity", "Economy", "Environment"],
    totalTopics: 256,
    accuracy: 62,
    strengths: ["Modern History", "Indian Geography"],
    weaknesses: ["Constitutional Law", "Economics"],
    lastStudied: "1 day ago",
    totalHours: 892,
    completionPercentage: 55,
    studyStreak: 8,
    nextMilestone: "Complete Environment Unit 3 - 60% done",
  },
};

export const getCourseData = (course: CourseType): CourseData => {
  return courseDataMap[course];
};

export const getCourseColorScheme = (course: CourseType) => {
  const colorMap = {
    jee: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-600",
      darkText: "dark:text-blue-400",
      badge: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
      button: "hover:bg-blue-500/20",
    },
    neet: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-600",
      darkText: "dark:text-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
      button: "hover:bg-emerald-500/20",
    },
    upsc: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      text: "text-purple-600",
      darkText: "dark:text-purple-400",
      badge: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
      button: "hover:bg-purple-500/20",
    },
  };

  return colorMap[course];
};

export const courseEmojis = {
  jee: "⚛️",
  neet: "🔬",
  upsc: "⚖️",
};

// Mock data for course-specific stats
export const getMockCourseStats = (course: CourseType) => {
  const data = getCourseData(course);
  return {
    todayProgress: Math.random() * 100,
    weekProgress: data.completionPercentage,
    subjectProgress: data.subjects.map((subject) => ({
      name: subject,
      progress: Math.floor(Math.random() * 100),
      accuracy: Math.floor(Math.random() * 30) + 50,
    })),
    recentTopics: [
      { name: "Topic 1", status: "completed", accuracy: data.accuracy },
      { name: "Topic 2", status: "in-progress", accuracy: Math.floor(Math.random() * 30) + 50 },
      { name: "Topic 3", status: "pending", accuracy: 0 },
    ],
  };
};
