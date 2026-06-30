export const normalizeMessageText = (text: string): string =>
  text
    .replace(/\r\n?/g, '\n')
    .replace(/ /g, ' ')
    .replace(/[^\S\n]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
