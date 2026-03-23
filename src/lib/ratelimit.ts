import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const ratelimitLogin = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  ephemeralCache: new Map(),
})

export const ratelimitRegister = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  ephemeralCache: new Map(),
})

export const ratelimitForgotPassword = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  ephemeralCache: new Map(),
})