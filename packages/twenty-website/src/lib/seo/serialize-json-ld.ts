import type { JsonLdValue } from './types/json-ld-value';

// Escape the script-significant characters to their \uXXXX form so the payload
// can never break out of the <script> element (e.g. via </script>). Mirrors the
// set used by serialize-javascript; they decode back when parsed as JSON.
export const serializeJsonLd = (data: JsonLdValue): string =>
  JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\//g, '\\u002f');
