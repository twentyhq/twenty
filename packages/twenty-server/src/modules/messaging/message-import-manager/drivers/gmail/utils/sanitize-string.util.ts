export const sanitizeString = (str: string) => {
  return str.replace(/\0/g, '');
};
