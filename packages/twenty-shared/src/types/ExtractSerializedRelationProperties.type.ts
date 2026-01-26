import { type SERIALIZED_RELATION_BRAND } from './SerializedRelation.type';

type HasSerializedRelationPropertyBrand<T> =
  typeof SERIALIZED_RELATION_BRAND extends keyof T ? true : false;

export type ExtractSerializedRelationProperties<T> = T extends unknown
  ? T extends object
    ? {
        [P in keyof T]-?: [NonNullable<T[P]>] extends [never]
          ? never
          : HasSerializedRelationPropertyBrand<NonNullable<T[P]>> extends true
            ? P
            : never;
      }[keyof T]
    : never
  : never;
