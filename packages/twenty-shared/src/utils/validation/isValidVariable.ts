export const isValidVariable = (variable: string): boolean => {
  return /^{{[^{}]+}}$/.test(variable);
};
