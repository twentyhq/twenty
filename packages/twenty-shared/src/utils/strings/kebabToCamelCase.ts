export const kebabToCamelCase = (str: string): string =>
  str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
