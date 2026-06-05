/**
 * Custom logging middleware to record request duration and client IP addresses
 */
export const logger = (req, res, next) => {
  const start = Date.now();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms - IP: ${ip}`);
  });

  next();
};
