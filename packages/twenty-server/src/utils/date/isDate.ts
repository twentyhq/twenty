// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isDate = (date: any): date is Date => {
  return date instanceof Date;
};
