export const convertViewFilterValueToString = (value: any) => {
  return typeof value === 'string' ? value : JSON.stringify(value ?? '');
};
