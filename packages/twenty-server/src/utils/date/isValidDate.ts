// oxlint-disable-next-line typescript/no-explicit-any
export const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};
