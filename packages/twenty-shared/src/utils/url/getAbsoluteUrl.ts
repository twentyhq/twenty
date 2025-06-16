export const getAbsoluteUrl = (value: string): string => {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return `https://${value}`;
};
