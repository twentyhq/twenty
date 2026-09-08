export const decodeHtmlAttributeUrl = (rawUrl: string): string =>
  rawUrl
    .trim()
    .replaceAll(/&(?:amp|#38|#[xX]26);/g, '&')
    .replaceAll(/&#(?:39|x27);/g, "'")
    .replaceAll(/&(?:quot|#34|#[xX]22);/g, '"');
