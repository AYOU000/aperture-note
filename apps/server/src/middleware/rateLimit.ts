import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, // Limit each IP to 10 requests per window (for registration/login)
  message: {
    message: "Too many attempts from this IP, please try again after 15 minutes",
    status: 429
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});