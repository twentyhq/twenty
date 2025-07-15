export const safeNewUrl = (url: string) => {
  try {
    return new URL(url);
  } catch (e: unknown) {
    return null;
  }
};
