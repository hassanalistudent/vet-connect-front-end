// utils/emailVerificationToken.js - ✅ FIXED for ESM
import crypto from "crypto";
import User from "../models/user.js";

// Generate a random verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Attach token + expiry to a user
const setVerificationToken = async (user) => {
  const token = generateVerificationToken();
  user.verificationToken = token;
  user.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24h
  await user.save();
  return token;
};

// Verify token and mark user as verified
const verifyEmailToken = async (email, token) => {
  const user = await User.findOne({ email, verificationToken: token });
  if (!user || user.verificationTokenExpiry < Date.now()) {
    throw new Error("Invalid or expired token");
  }
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();
  return user;
};

export { setVerificationToken, verifyEmailToken };