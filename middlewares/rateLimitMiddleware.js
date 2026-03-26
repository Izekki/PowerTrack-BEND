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

export const loginRateLimit = buildRateLimiter(5, 15 * 60 * 1000);

export const passwordRecoveryRequestRateLimit = buildRateLimiter(3, 15 * 60 * 1000);

export const passwordRecoveryResetRateLimit = buildRateLimiter(5, 15 * 60 * 1000);