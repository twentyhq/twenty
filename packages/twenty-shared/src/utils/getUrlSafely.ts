export const getUrlSafely = (url: string) => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};
