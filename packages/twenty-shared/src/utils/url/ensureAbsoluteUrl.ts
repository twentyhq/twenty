export const ensureAbsoluteUrl = (value: string): string => {
  const trimmedValue = value.trim();

  // URL schemes are case-insensitive, so match any casing (e.g. mobile
  // keyboards auto-capitalize the first letter into "Https://")
  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
};
