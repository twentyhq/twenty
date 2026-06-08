import serialize from 'serialize-javascript';

type JsonLdPrimitive = boolean | number | string | null;

export type JsonLdValue =
  | JsonLdPrimitive
  | JsonLdValue[]
  | { [key: string]: JsonLdValue | undefined };

export function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serialize(data, { isJSON: true }) }}
      type="application/ld+json"
    />
  );
}
