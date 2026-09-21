// JSON.stringify output is inlined into a <script> body, where the HTML parser
// still scans for "</script" and "<!--" before any JSON parsing happens. Names
// reaching this payload come from the marketplace and partners APIs, so they
// could otherwise close the tag and inject markup. Escaping as JSON unicode
// sequences parses back to the same string while staying inert in HTML.
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
