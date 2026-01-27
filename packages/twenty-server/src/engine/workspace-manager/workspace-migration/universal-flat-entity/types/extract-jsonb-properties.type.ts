import { type JSONB_PROPERTY_BRAND } from './jsonb-property.type';

export type HasJsonbPropertyBrand<T> =
  typeof JSONB_PROPERTY_BRAND extends keyof T ? true : false;

// Distributive check: returns `true` if any member of a union has the brand
type HasJsonbBrandInUnion<T> = T extends unknown
  ? HasJsonbPropertyBrand<T>
  : never;

export type ExtractJsonbProperties<T> = NonNullable<
  {
    [P in keyof T]-?: true extends HasJsonbBrandInUnion<NonNullable<T[P]>>
      ? P
      : never;
  }[keyof T]
>;
