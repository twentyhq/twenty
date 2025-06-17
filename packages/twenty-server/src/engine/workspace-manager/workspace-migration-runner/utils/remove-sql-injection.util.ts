export const removeSqlDDLInjection = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9_]/g, '');
};
