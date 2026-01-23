import { type __SerializedRelationBrand__ } from './SerializedRelation.type';

export type ExtractSerializedRelationProperties<T> = NonNullable<
  {
    [P in keyof T]-?: [NonNullable<T[P]>] extends [never]
      ? never
      : __SerializedRelationBrand__ extends keyof NonNullable<T[P]>
        ? P
        : never;
  }[keyof T]
>;
