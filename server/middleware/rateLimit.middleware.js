import { redisGet, redisSet } from "../configs/redis.js"

const rateLimitAI = async (req, res, next) => {
  try {
    const identifier = req.user?._id?.toString() || req.ip
    const key = `ratelimit:ai:${identifier}`
    const current = await redisGet(key)
    const count = current ? parseInt(current) : 0

    if (count >= 10) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please wait a minute and try again.",
      })
    }

    if (count === 0) {
      await redisSet(key, "1", 60)
    } else {
      await redisSet(key, String(count + 1), 60)
    }
    next()
  } catch {
    // Redis down — allow request through, never block
    next()
  }
}

export default rateLimitAI
