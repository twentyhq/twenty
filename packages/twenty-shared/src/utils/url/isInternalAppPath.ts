export const isInternalAppPath = (url: string): boolean =>
  /^\/(?!\/)/.test(url) && !url.includes('\\');
