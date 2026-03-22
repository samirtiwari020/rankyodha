import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

const MAX_RETRY_ATTEMPTS = 3;

export const connectDB = async () => {
  if (!env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Database connection is required.");
  }

  if (
    env.MONGO_URI.includes("<username>") ||
    env.MONGO_URI.includes("<password>") ||
    env.MONGO_URI.includes("<cluster>") ||
    env.MONGO_URI.includes("<database>")
  ) {
    throw new Error("MONGO_URI is a template placeholder. Please provide a valid MongoDB URI.");
  }

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        retryWrites: true
      });
      logger.info("✅ MongoDB connected successfully");
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (attempt < MAX_RETRY_ATTEMPTS) {
        logger.warn(`[Attempt ${attempt}/${MAX_RETRY_ATTEMPTS}] MongoDB connection failed. Retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        throw new Error(`MongoDB connection failed after ${MAX_RETRY_ATTEMPTS} attempts: ${message}`);
      }
    }
  }
};
