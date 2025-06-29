/**
 * Removes null characters (\0) from a string to prevent unexpected errors
 */
export const sanitizeString = (str: string) => {
  return str.replace(/\0/g, '');
};
