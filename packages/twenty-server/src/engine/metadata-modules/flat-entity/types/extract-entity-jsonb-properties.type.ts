import { type JsonbPropertyBrand } from 'src/engine/workspace-manager/types/jsonb-property.type';

export type ExtractEntityJsonbProperties<T> = NonNullable<
  {
    [P in keyof T]: [NonNullable<T[P]>] extends [never]
      ? never
      : NonNullable<T[P]> extends { [JsonbPropertyBrand]?: true }
        ? P
        : never;
  }[keyof T]
>;
