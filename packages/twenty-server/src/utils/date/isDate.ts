export const isDate = (date: any): date is Date => {
  return date instanceof Date;
};
