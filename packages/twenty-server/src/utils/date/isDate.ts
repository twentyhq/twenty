// oxlint-disable-next-line @typescripttypescript/no-explicit-any
export const isDate = (date: any): date is Date => {
  return date instanceof Date;
};
