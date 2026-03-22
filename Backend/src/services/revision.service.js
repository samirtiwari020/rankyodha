import { DEFAULT_REVISION_GAP_DAYS } from "../utils/constants.js";

export const calculateNextRevisionDate = (confidence = 3) => {
  const normalized = Math.max(1, Math.min(5, confidence));
  const gap = DEFAULT_REVISION_GAP_DAYS[normalized - 1] || 7;
  const date = new Date();
  date.setDate(date.getDate() + gap);
  return date;
};
