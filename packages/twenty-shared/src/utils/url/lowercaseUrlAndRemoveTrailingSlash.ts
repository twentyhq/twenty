export const lowercaseUrlAndRemoveTrailingSlash = (url: string) => {
  try {
    return new URL(url).toString().toLowerCase().replace(/\/$/, '');
  } catch {
    return url.toLowerCase();
  }
};
