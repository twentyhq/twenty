import { type SERIALIZED_RELATION_BRAND } from './SerializedRelation.type';

// Check if a type has a string index signature (e.g., Record<string, X>)
// This is true when `string` itself is assignable to keyof T

// Check if T has the serialized relation brand as a specific property
// Excludes types with string index signatures to avoid false positives
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
