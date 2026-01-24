import { JSONB_PROPERTY_BRAND } from '@/types/JsonbProperty.type';

// Distributive check: returns `true` if any member of a union has the brand
type HasJsonbBrandInUnion<T> = T extends unknown
  ? typeof JSONB_PROPERTY_BRAND extends keyof T
    ? true
    : never
  : never;

export type ExtractJsonbProperties<T> = NonNullable<
  {
    [P in keyof T]-?: true extends HasJsonbBrandInUnion<NonNullable<T[P]>>
      ? P
      : never;
  }[keyof T]
>;
