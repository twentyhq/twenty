export const richTextExcerpt = (markdown: string, maxChars = 220): string => {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/[*_~`]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > maxChars
    ? plain.slice(0, maxChars).trimEnd() + '…'
    : plain;
};
