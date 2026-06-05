const ipCache = new Map();

/**
 * Custom IP-based rate limiter middleware
 * Options:
 * - windowMs: Time window in milliseconds (default: 15 minutes)
 * - max: Maximum number of requests allowed in the window (default: 100)
 */
export const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 100;

  // Cleanup expired entries periodically to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipCache.entries()) {
      if (now > data.resetTime) {
        ipCache.delete(ip);
      }
    }
  }, 60 * 1000).unref();

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    if (!ipCache.has(ip)) {
      ipCache.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
      return next();
    }

    const data = ipCache.get(ip);

    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
    } else {
      data.count += 1;
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - data.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(data.resetTime / 1000));

    if (data.count > max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests from this IP, please try again later.'
      });
    }

    next();
  };
};
