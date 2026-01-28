export const extractHtmlTag = (tag: string): string => {
  return tag.startsWith('html-') ? tag.slice(5) : tag;
};
