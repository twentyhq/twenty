import { __JsonbPropertyBrand__ } from 'src/engine/workspace-manager/types/jsonb-property.type';

export type ExtractEntityJsonbProperties<T> = NonNullable<
  {
    [P in keyof T]-?: [NonNullable<T[P]>] extends [never]
      ? never
      : typeof __JsonbPropertyBrand__ extends keyof NonNullable<T[P]>
        ? P
        : never;
  }[keyof T]
>;
