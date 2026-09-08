export const decodeHtmlAttributeUrl = (rawUrl: string): string =>
  rawUrl
    .trim()
    .replace(/&(?:amp|#38|#[xX]26);/g, '&')
    .replace(/&#(?:39|x27);/g, "'")
    .replace(/&(?:quot|#34|#[xX]22);/g, '"');
