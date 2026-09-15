import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err.message);
});

redisClient.on("connect", () => {
  console.log("Redis connected");
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.warn("Redis unavailable, caching disabled:", err.message);
  }
};

connectRedis();

export const redisGet = async (key) => {
  try {
    if (!redisClient.isOpen) return null;
    return await redisClient.get(key);
  } catch { return null; }
};

export const redisSet = async (key, value, ttlSeconds = 3600) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.setEx(key, ttlSeconds, value);
  } catch { /* silent fail */ }
};

export const redisDel = async (key) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.del(key);
  } catch { /* silent fail */ }
};

export default redisClient;
