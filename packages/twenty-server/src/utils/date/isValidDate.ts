// oxlint-disable-next-line @typescripttypescript/no-explicit-any
export const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};
