import { __JsonbPropertyBrand__ } from './JsonbProperty.type';

export type ExtractJsonbProperties<T> = NonNullable<
  {
    [P in keyof T]-?: [NonNullable<T[P]>] extends [never]
      ? never
      : typeof __JsonbPropertyBrand__ extends keyof NonNullable<T[P]>
        ? P
        : never;
  }[keyof T]
>;
