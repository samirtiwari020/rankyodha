import dotenv from "dotenv";

dotenv.config();

const rawMongoUri = process.env.MONGO_URI || "";
const expandedMongoUri = rawMongoUri.replace(
  "${MONGODB_ATLAS_URL}",
  process.env.MONGODB_ATLAS_URL || ""
);

const requiredInProduction = ["JWT_SECRET"];

if (process.env.NODE_ENV === "production") {
  requiredInProduction.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  MONGO_URI: expandedMongoUri || process.env.MONGODB_ATLAS_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "dev_jwt_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "*"
};
