import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  const token = signToken({ userId: user._id });

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, points: user.points }
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase() });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = signToken({ userId: user._id });
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, points: user.points }
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json(req.user);
});
