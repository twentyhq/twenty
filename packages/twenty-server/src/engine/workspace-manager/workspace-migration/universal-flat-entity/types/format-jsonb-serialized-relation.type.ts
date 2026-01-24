import { type RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/remove-suffix.type';
import {
  ExtractSerializedRelationProperties,
  HasJsonbPropertyBrand,
  JSONB_PROPERTY_BRAND,
} from 'twenty-shared/types';

export type FormatJsonbSerializedRelation<T> = T extends unknown
  ? T extends (infer U)[]
    ? FormatJsonbSerializedRelation<U>[]
    : HasJsonbPropertyBrand<T> extends true
      ? Omit<
          {
            [P in keyof T as P extends ExtractSerializedRelationProperties<T> &
              string
              ? `${RemoveSuffix<P, 'Id'>}UniversalIdentifier`
              : P]: T[P];
          },
          typeof JSONB_PROPERTY_BRAND
        >
      : T
  : never;
