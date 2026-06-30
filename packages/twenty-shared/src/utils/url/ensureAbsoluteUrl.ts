export const ensureAbsoluteUrl = (value: string): string => {
  const trimmedValue = value.trim();

  if (
    trimmedValue.startsWith('http://') ||
    trimmedValue.startsWith('https://') ||
    trimmedValue.startsWith('HTTPS://') ||
    trimmedValue.startsWith('HTTP://')
  ) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
};
