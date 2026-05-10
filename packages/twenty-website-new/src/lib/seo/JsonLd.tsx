type JsonLdPrimitive = boolean | number | string | null;

export type JsonLdValue =
  | JsonLdPrimitive
  | JsonLdValue[]
  | { [key: string]: JsonLdValue | undefined };

const serializeJsonLd = (data: JsonLdValue): string =>
  JSON.stringify(data).replace(/</g, '\\u003c');

export function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      type="application/ld+json"
    />
  );
}
