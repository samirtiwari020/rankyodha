import mongoose from "mongoose";
import BC from "bcryptjs";
import User from "./src/models/User.js";
import { signToken } from "./src/utils/token.js";
import dotenv from "dotenv";

dotenv.config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URL || process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Check if test user exists
    let user = await User.findOne({ email: "test@example.com" });

    if (!user) {
      const hashedPassword = await BC.hash("Test@123", 10);
      user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword
      });
      console.log("✅ Test user created");
    } else {
      console.log("✅ Test user already exists");
    }

    const token = signToken({ userId: user._id });
    console.log("\n🔐 JWT Token:");
    console.log(token);
    console.log("\n📝 Use this header:");
    console.log(`Authorization: Bearer ${token}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createTestUser();
