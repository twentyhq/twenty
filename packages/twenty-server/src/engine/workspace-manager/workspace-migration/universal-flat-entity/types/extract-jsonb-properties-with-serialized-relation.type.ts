import {
  type ExtractSerializedRelationProperties,
  type IsSerializedRelation,
} from 'twenty-shared/types';

import { type ExtractJsonbProperties } from './extract-jsonb-properties.type';

type ContainsSerializedRelation<T> = T extends unknown
  ?
    IsSerializedRelation<T> extends true
    ? true
    : // Check if T has any direct SerializedRelation properties (using existing utility)
      [ExtractSerializedRelationProperties<T>] extends [never]
      ? // No direct SerializedRelation, recurse into nested structures
        T extends readonly (infer U)[]
        ? ContainsSerializedRelation<U>
        : T extends object
          ? true extends ContainsSerializedRelation<T[keyof T]>
            ? true
            : false
          : false
      : // Has at least one direct SerializedRelation property
        true
  : never;

export type ExtractJsonbPropertiesWithSerializedRelation<T> = {
  [P in ExtractJsonbProperties<T>]: true extends ContainsSerializedRelation<
    NonNullable<T[P]>
  >
    ? P
    : never;
}[ExtractJsonbProperties<T>];
