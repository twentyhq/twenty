export const isAbsoluteUrl = (url: string): boolean =>
  /^https?:\/\//i.test(url);
