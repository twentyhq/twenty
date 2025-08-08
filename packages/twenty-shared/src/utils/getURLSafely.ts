export const getURLSafely = (url: string) => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};
