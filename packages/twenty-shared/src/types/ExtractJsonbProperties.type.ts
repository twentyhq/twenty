import { JSONB_PROPERTY_BRAND } from '@/types/JsonbProperty.type';

export type ExtractJsonbProperties<T> = NonNullable<
  {
    [P in keyof T]-?: [NonNullable<T[P]>] extends [never]
      ? never
      : typeof JSONB_PROPERTY_BRAND extends keyof NonNullable<T[P]>
        ? P
        : never;
  }[keyof T]
>;
