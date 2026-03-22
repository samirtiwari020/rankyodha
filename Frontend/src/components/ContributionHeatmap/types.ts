/**
 * Contribution Heatmap Types
 * 
 * Type definitions for the GitHub-style contribution heatmap component.
 */

/**
 * Single day contribution data
 */
export interface ContributionData {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Activity level (0-4) */
  count: number;
}

/**
 * Color configuration for intensity levels
 */
export interface IntensityLevel {
  level: number;
  label: string;
  bg: string; // Tailwind class
}

/**
 * Color information for a specific intensity
 */
export interface IntensityColor {
  bg: string;
  hover: string;
}

/**
 * Statistics calculated from contribution data
 */
export interface ContributionStats {
  /** Total contributions across all days */
  total: number;
  /** Maximum contributions on any single day */
  maxDay: number;
  /** Number of days with at least 1 contribution */
  activeDays: number;
  /** Total days in the dataset */
  totalDays: number;
}

/**
 * Props for the main ContributionHeatmap component
 */
export interface ContributionHeatmapProps {
  /** Custom contribution data (optional) */
  data?: ContributionData[];
  /** Year to display (default: current year) */
  year?: number;
  /** Show color intensity legend (default: true) */
  showLegend?: boolean;
  /** Show hover tooltip (default: true) */
  showTooltip?: boolean;
  /** Callback when a day is clicked */
  onDayClick?: (date: string, count: number) => void;
  /** Enable animations (default: true) */
  animated?: boolean;
  /** Additional CSS classes for the container */
  containerClassName?: string;
}

/**
 * Props for the HeatmapGrid component
 */
export interface HeatmapGridProps {
  year: number;
  data: Map<string, number>;
  hoveredDate: string | null;
  onDayHover: (date: string | null) => void;
  onDayClick: (date: string) => void;
  animated: boolean;
}

/**
 * Props for the HeatmapDay component
 */
export interface HeatmapDayProps {
  date?: string;
  count: number;
  isHovered: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
}

/**
 * Props for the HeatmapTooltip component
 */
export interface HeatmapTooltipProps {
  date: string;
  count: number;
  position: { x: number; y: number };
}

/**
 * Internal week structure
 */
export interface Week {
  days: Array<{ date: string; count: number } | null>;
  startDate: Date;
}

/**
 * Activity level type (0-4)
 */
export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Month label config
 */
export interface MonthLabel {
  month: string;
  weekIndex: number;
}
