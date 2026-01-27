import { type ExtractSerializedRelationProperties } from 'twenty-shared/types';

import { type RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/remove-suffix.type';

export type FormatJsonbSerializedRelation<T> = T extends unknown
  ? T extends (infer U)[]
    ? FormatJsonbSerializedRelation<U>[]
    : T extends string
      ? T
      : T extends object
        ? {
            [P in keyof T as P extends ExtractSerializedRelationProperties<T> &
              string
              ? `${RemoveSuffix<P, 'Id'>}UniversalIdentifier`
              : P]: FormatJsonbSerializedRelation<T[P]>;
          }
        : T
  : never;
