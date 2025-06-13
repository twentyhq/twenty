export const isValidVariable = (variable: string): boolean => {
  return (
    variable.startsWith('{{') &&
    variable.endsWith('}}') &&
    variable.match(/{{[^}]+}}/) !== null
  );
};
