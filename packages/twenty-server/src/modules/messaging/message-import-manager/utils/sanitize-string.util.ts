const NULL_CHAR_REGEX = /\0/g;

export const sanitizeString = (str: string) => {
  return str.replace(NULL_CHAR_REGEX, '');
};
