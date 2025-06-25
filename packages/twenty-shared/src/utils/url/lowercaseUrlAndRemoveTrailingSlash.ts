export const lowercaseUrlAndRemoveTrailingSlash = (url: string) => {
  try {
    return new URL(url).toString().replace(/\/$/, '');
  } catch {
    return url;
  }
};
