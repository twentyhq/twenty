import { type SerializedRelationBrand } from './SerializedRelation.type';

export type ExtractSerializedRelationProperties<T> = NonNullable<
  {
    [P in keyof T]-?: [NonNullable<T[P]>] extends [never]
      ? never
      : NonNullable<T[P]> extends { [SerializedRelationBrand]?: true }
        ? NonNullable<P>
        : never;
  }[keyof T]
>;
