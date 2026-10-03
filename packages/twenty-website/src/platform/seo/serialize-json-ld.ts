// Names come from the marketplace and partners APIs and could close the <script> tag, so escape to inert JSON unicode.
const HTML_SIGNIFICANT_CHARACTERS_PATTERN = /[<>&]/g;

const HTML_SIGNIFICANT_CHARACTER_ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
};

export const serializeJsonLd = (data: Record<string, unknown>): string =>
  JSON.stringify(data).replace(
    HTML_SIGNIFICANT_CHARACTERS_PATTERN,
    (character) => HTML_SIGNIFICANT_CHARACTER_ESCAPES[character],
  );
