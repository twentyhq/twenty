export const safeDecodeURIComponent = (text: string): string => {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
};
