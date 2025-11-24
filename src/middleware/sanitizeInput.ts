/**
 * Sanitize input to prevent XSS attacks
 * Removes potentially dangerous characters
 */
export const sanitizeInput = (str: unknown): string => {
  if (typeof str !== 'string') return String(str);

  return str
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
    .substring(0, 500); // Limit length
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj: unknown): unknown => {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeInput(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = sanitizeObject((obj as Record<string, unknown>)[key]);
    }
  }
  return sanitized;
};
