const HTML_ATTRIBUTE_URL_ENTITY_TO_CHARACTER: Record<string, string> = {
  '&amp;': '&',
  '&#38;': '&',
  '&#x26;': '&',
  '&#39;': "'",
  '&#x27;': "'",
  '&quot;': '"',
  '&#34;': '"',
  '&#x22;': '"',
};

export const decodeHtmlAttributeUrl = (rawUrl: string): string =>
  rawUrl
    .trim()
    .replace(
      /&(?:amp|#38|#x26|quot|#34|#x22|#39|#x27);/gi,
      (entity) => HTML_ATTRIBUTE_URL_ENTITY_TO_CHARACTER[entity.toLowerCase()],
    );
