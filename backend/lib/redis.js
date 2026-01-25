import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
	tls: {
		rejectUnauthorized: false,
	},
	maxRetriesPerRequest: 3,
	retryStrategy(times) {
		if (times > 3) return null;
		return Math.min(times * 200, 1000);
	},
	connectTimeout: 10000,
});

redis.on("connect", () => {
	console.log("✅ Redis connected (Upstash)");
});

redis.on("error", (err) => {
	console.error("❌ Redis error:", err.message);
});

export default redis;

