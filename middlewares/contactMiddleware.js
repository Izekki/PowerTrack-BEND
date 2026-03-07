const CONTACT_LIMITS = {
  fullName: 120,
  email: 160,
  subject: 180,
  message: 3000
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactRequests = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

const normalizeText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

export const validateContactPayload = (req, res, next) => {
  const normalized = {
    fullName: normalizeText(req.body?.fullName),
    email: normalizeText(req.body?.email),
    subject: normalizeText(req.body?.subject),
    message: normalizeText(req.body?.message)
  };

  if (!normalized.fullName || !normalized.email || !normalized.subject || !normalized.message) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son obligatorios'
    });
  }

  if (!EMAIL_REGEX.test(normalized.email)) {
    return res.status(400).json({
      success: false,
      message: 'Correo electronico invalido'
    });
  }

  if (normalized.fullName.length > CONTACT_LIMITS.fullName) {
    return res.status(400).json({
      success: false,
      message: `El nombre no puede exceder ${CONTACT_LIMITS.fullName} caracteres`
    });
  }

  if (normalized.email.length > CONTACT_LIMITS.email) {
    return res.status(400).json({
      success: false,
      message: `El correo no puede exceder ${CONTACT_LIMITS.email} caracteres`
    });
  }

  if (normalized.subject.length > CONTACT_LIMITS.subject) {
    return res.status(400).json({
      success: false,
      message: `El asunto no puede exceder ${CONTACT_LIMITS.subject} caracteres`
    });
  }

  if (normalized.message.length > CONTACT_LIMITS.message) {
    return res.status(400).json({
      success: false,
      message: `El mensaje no puede exceder ${CONTACT_LIMITS.message} caracteres`
    });
  }

  req.body = normalized;
  next();
};

export const contactRateLimit = (req, res, next) => {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '');
  const forwardedIp = forwardedFor.split(',')[0].trim();
  const clientKey = req.ip || forwardedIp || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const current = contactRequests.get(clientKey) || { count: 0, startTime: now };

  // Limpia entradas antiguas para evitar crecimiento indefinido en memoria.
  for (const [key, data] of contactRequests.entries()) {
    if (now - data.startTime > WINDOW_MS) {
      contactRequests.delete(key);
    }
  }

  if (now - current.startTime > WINDOW_MS) {
    contactRequests.set(clientKey, { count: 1, startTime: now });
    return next();
  }

  if (current.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes, intenta mas tarde'
    });
  }

  current.count += 1;
  contactRequests.set(clientKey, current);
  next();
};
