import redis from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import sendOtpFlow from "../utlis/sendOtpFlow.js";
import sendLoginAlertEmail from "../utlis/sendLoginAlertEmail.js";
import crypto from "crypto";
import sendResetPasswordEmail from "../utlis/sendResetPasswordEmail.js";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60);
};

// ✅ FIXED COOKIE OPTIONS (works dev + prod)
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions(),
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      emailVerified: false,
    });

    await sendOtpFlow(user);

    return res.status(201).json({
      message: "OTP sent to email",
      email: user.email,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Signup failed" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

    user.otp = undefined;
    user.otpExpiry = undefined;
    user.emailVerified = true;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    return res.json({
      message: "Signup successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    await sendLoginAlertEmail({
      email: user.email,
      browser: req.headers["user-agent"],
      ip: req.ip,
    });

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    // ✅ clear with same options
    res.clearCookie("accessToken", cookieOptions());
    res.clearCookie("refreshToken", cookieOptions());

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Logout failed" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      ...cookieOptions(),
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ message: "Token refreshed" });
  } catch (error) {
    return res.status(500).json({ message: "Token refresh failed" });
  }
};

export const getProfile = async (req, res) => {
  return res.json(req.user);
};

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const token = req.body.token;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        authProvider: "google",
        emailVerified: true,
        password: Math.random().toString(36),
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    await sendLoginAlertEmail({
      email: user.email,
      browser: req.headers["user-agent"],
      ip: req.ip,
    });

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(401).json({ message: "Google authentication failed" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "If user exists, email sent" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;

  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendResetPasswordEmail(user.email, resetUrl);

  res.json({ message: "Reset link sent" });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token missing" });
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
};
