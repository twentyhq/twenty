const NULL_CHAR_REGEX = /\0/g;

/**
 * Removes null characters (\0) from a string to prevent unexpected errors
 */
export const sanitizeString = (str: string) => {
  return str.replace(NULL_CHAR_REGEX, '');
};
