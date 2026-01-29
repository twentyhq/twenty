import {
  type ExtractSerializedRelationProperties,
  type IsSerializedRelation,
} from 'twenty-shared/types';

export type ContainsSerializedRelation<T> = T extends unknown
  ? IsSerializedRelation<T> extends true
    ? true
    : // Check arrays first to avoid T[keyof T] issues with branded arrays
      T extends readonly (infer U)[]
      ? ContainsSerializedRelation<U>
      : // Check if T has any direct SerializedRelation properties
        [ExtractSerializedRelationProperties<T>] extends [never]
        ? // No direct SerializedRelation, recurse into nested object structures
          T extends object
          ? true extends ContainsSerializedRelation<T[keyof T]>
            ? true
            : false
          : false
        : true
  : never;
