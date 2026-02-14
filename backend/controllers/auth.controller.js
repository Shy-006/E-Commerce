import redis from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

/* ===================== TOKEN HELPERS ===================== */
const generateTokens = (userId) => {
	const accessToken = jwt.sign(
		{ userId },
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: "15m" }
	);

	const refreshToken = jwt.sign(
		{ userId },
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: "7d" }
	);

	return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
	await redis.set(
		`refresh_token:${userId}`,
		refreshToken,
		"EX",
		7 * 24 * 60 * 60
	);
};

const setCookies = (res, accessToken, refreshToken) => {
	const isProduction = process.env.NODE_ENV === "production";

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: isProduction,        // MUST be true in production (HTTPS)
		sameSite: isProduction ? "none" : "lax",
		maxAge: 15 * 60 * 1000,
	});

	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "none" : "lax",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});
};


/* ===================== SIGNUP ===================== */
export const signup = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		const user = await User.create({
			name,
			email,
			password,
		});

		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);
		setCookies(res, accessToken, refreshToken);

		return res.status(201).json({
			message: "Signup successful",
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Signup error:", error);
		return res.status(500).json({ message: "Signup failed" });
	}
};

/* ===================== LOGIN ===================== */
export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}

		const user = await User.findOne({ email });
		if (!user || !(await user.comparePassword(password))) {
			return res.status(400).json({ message: "Invalid email or password" });
		}

		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);
		setCookies(res, accessToken, refreshToken);

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

/* ===================== LOGOUT ===================== */
export const logout = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (refreshToken) {
			const decoded = jwt.verify(
				refreshToken,
				process.env.REFRESH_TOKEN_SECRET
			);
			await redis.del(`refresh_token:${decoded.userId}`);
		}

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");

		return res.json({ message: "Logged out successfully" });
	} catch (error) {
		return res.status(500).json({ message: "Logout failed" });
	}
};

/* ===================== REFRESH TOKEN ===================== */
export const refreshToken = async (req, res) => {
	try {
		const token = req.cookies.refreshToken;

		if (!token) {
			return res.status(401).json({ message: "No refresh token" });
		}

		const decoded = jwt.verify(
			token,
			process.env.REFRESH_TOKEN_SECRET
		);

		const storedToken = await redis.get(
			`refresh_token:${decoded.userId}`
		);

		if (storedToken !== token) {
			return res.status(401).json({ message: "Invalid refresh token" });
		}

		const accessToken = jwt.sign(
			{ userId: decoded.userId },
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: "15m" }
		);

		const isProduction = process.env.NODE_ENV === "production";

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: isProduction,              // must be true in production
			sameSite: isProduction ? "none" : "lax",
			maxAge: 15 * 60 * 1000,
		});

		return res.json({ message: "Token refreshed" });

	} catch (error) {
		console.error("Refresh token error:", error);
		return res.status(500).json({ message: "Token refresh failed" });
	}
};

/* ===================== PROFILE ===================== */
export const getProfile = async (req, res) => {
	return res.json(req.user);
};

/* ===================== GOOGLE LOGIN ===================== */
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
				password: Math.random().toString(36),
			});
		}

		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);
		setCookies(res, accessToken, refreshToken);

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
