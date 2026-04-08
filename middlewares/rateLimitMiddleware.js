import rateLimit from 'express-rate-limit';

const buildRateLimiter = (max, windowMs) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta nuevamente más tarde.',
  },
});

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta nuevamente más tarde.',
  },
});

export const passwordRecoveryRequestRateLimit = buildRateLimiter(3, 15 * 60 * 1000);

export const passwordRecoveryResetRateLimit = buildRateLimiter(5, 15 * 60 * 1000);