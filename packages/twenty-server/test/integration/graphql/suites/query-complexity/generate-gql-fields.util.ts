export const generateGqlFields = (count: number): string => {
  return Array.from({ length: count }, (_) => `id`).join('\n');
};
