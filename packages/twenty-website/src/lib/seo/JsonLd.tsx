import { serializeJsonLd } from './serialize-json-ld';
import type { JsonLdValue } from './types/json-ld-value';

export function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      type="application/ld+json"
    />
  );
}
