export const getAbsoluteUrl = (value: string): string => {
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('HTTPS://') ||
    value.startsWith('HTTP://')
  ) {
    return value;
  }

  return `https://${value}`;
};
