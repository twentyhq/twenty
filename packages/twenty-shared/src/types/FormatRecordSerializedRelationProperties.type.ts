import { type ExtractSerializedRelationProperties } from '@/types/ExtractSerializedRelationProperties.type';
import { type IsSerializedRelation } from '@/types/IsSerializedRelation.type';
import { type RemoveSuffix } from '@/types/RemoveSuffix.type';

// Determines if a property should be transformed to a universal identifier
// A property is transformed only if:
// 1. It matches ExtractSerializedRelationProperties (has the serialized relation brand)
// 2. Its value does NOT have a string index signature (not a Record<string, X>)
type ShouldTransformToUniversalIdentifier<T, P extends keyof T> = [P] extends [
  ExtractSerializedRelationProperties<T>,
]
  ? string extends keyof NonNullable<T[P]>
    ? false
    : true
  : false;

export type FormatRecordSerializedRelationProperties<T> = T extends unknown
  ? T extends (infer U)[]
    ? FormatRecordSerializedRelationProperties<U>[]
    : T extends string
      ? // By definition we assume that any SerializedRelation are not enforced at pg scope through an FK
        // Which mean that SerializedRelation might resolve to non-existent entities ( null )
        IsSerializedRelation<T> extends true
        ? T | null
        : T
      : T extends object
        ? {
            [P in keyof T as ShouldTransformToUniversalIdentifier<
              T,
              P
            > extends true
              ? P extends string
                ? `${RemoveSuffix<P, 'Id'>}UniversalIdentifier`
                : P
              : P]: FormatRecordSerializedRelationProperties<T[P]>;
          }
        : T
  : never;
