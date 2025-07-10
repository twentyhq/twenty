export const lowercaseUrlRemoveTrailingSlashAndAddHttps = (url: string) => {
  try {
    return new URL(url).toString().toLowerCase().replace(/\/$/, '');
  } catch {
    if (!url.includes('://')) {
      try {
        return new URL(`https://${url}`)
          .toString()
          .toLowerCase()
          .replace(/\/$/, '');
      } catch {
        return url.toLowerCase();
      }
    }
    return url.toLowerCase();
  }
};
