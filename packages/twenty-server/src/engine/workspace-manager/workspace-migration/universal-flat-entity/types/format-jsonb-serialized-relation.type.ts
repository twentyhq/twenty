import { type ExtractSerializedRelationProperties } from 'twenty-shared/types';

import { type HasJsonbPropertyBrand } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/extract-jsonb-properties.type';
import { type JSONB_PROPERTY_BRAND } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';
import { type RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/remove-suffix.type';

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
