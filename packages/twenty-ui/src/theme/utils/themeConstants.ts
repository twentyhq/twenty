export const camelToKebab = (str: string): string =>
  str.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);

export const formatSpacingKey = (n: number): string =>
  String(n).replace('.', '_');

export const SPACING_VALUES = [
  0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7, 8, 9,
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 24, 30, 32,
];
