export const camelToKebab = (str: string): string =>
  str.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);
