export const ERROR_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  INTERNAL_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Validation failed',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_REGISTERED: 'Email already registered',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  INTERNAL_ERROR: 'Internal Server Error',
} as const;

export const LIMITS = {
  MAX_REQUESTS_PER_HOUR: 100,
  MIN_PASSWORD_LENGTH: 8,
} as const;