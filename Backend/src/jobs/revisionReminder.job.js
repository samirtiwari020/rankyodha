import { logger } from "../utils/logger.js";

export const startRevisionReminderJob = () => {
  setInterval(() => {
    logger.info("Revision reminder job heartbeat");
  }, 60 * 60 * 1000);
};
