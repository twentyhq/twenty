export const normalizeUrl = (url: string): string => {
  try {
    return new URL(url).toString();
  } catch {
    return url;
  }
};
