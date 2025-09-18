export const safeDecodeURIComponent = (text: string): string => {
  try {
    return decodeURIComponent(text);
    // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (error) {
    return text;
  }
};
