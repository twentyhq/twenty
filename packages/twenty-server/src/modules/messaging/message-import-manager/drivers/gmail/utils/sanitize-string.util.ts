export const sanitizeString = (str: string) => {
  return str.replace(/\0/g, '');
};

/**
 * Sanitizes an email address to ensure it's in a valid format
 * - Removes null characters
 * - Normalizes Unicode characters
 * - Ensures proper encoding
 */
export const sanitizeEmailAddress = (email: string): string => {
  if (!email) return '';
  
  // Remove null characters
  let sanitized = email.replace(/\0/g, '');
  
  // Normalize Unicode characters
  sanitized = sanitized.normalize('NFKC');
  
  // Remove any non-printable characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  
  // Ensure proper email format
  const parts = sanitized.split('@');
  if (parts.length !== 2) return sanitized;
  
  // Sanitize local part and domain separately
  const localPart = parts[0].replace(/[^\w.!#$%&'*+/=?^`{|}~-]/g, '');
  const domain = parts[1].replace(/[^\w.-]/g, '');
  
  return `${localPart}@${domain}`.toLowerCase();
};
