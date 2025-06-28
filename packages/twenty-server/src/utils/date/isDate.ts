export const isDate = (date: unknown): date is Date => {
  return date instanceof Date;
};
