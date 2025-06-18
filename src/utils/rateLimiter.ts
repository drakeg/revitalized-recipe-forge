
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(key: string): number {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }

  getResetTime(key: string): number {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return Date.now() + this.windowMs;
    }
    return entry.resetTime;
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Create different rate limiters for different use cases
export const recipeAnalysisLimiter = new RateLimiter(60000, 5); // 5 requests per minute
export const authLimiter = new RateLimiter(900000, 5); // 5 requests per 15 minutes
export const generalLimiter = new RateLimiter(60000, 20); // 20 requests per minute

// Helper function to get client identifier
export function getClientId(req: Request): string {
  // Try to get IP from various headers
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0] || realIP || cfConnectingIP || 'unknown';
  
  // Also include user agent to make it slightly more unique
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const shortUA = userAgent.substring(0, 50); // Truncate to avoid too long keys
  
  return `${ip}:${shortUA}`;
}

// Cleanup function to run periodically
setInterval(() => {
  recipeAnalysisLimiter.cleanup();
  authLimiter.cleanup();
  generalLimiter.cleanup();
}, 300000); // Cleanup every 5 minutes
