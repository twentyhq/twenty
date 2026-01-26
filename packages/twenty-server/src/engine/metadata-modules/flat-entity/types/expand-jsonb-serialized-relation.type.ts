import { type HasJsonbPropertyBrand } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/extract-jsonb-properties.type';
import { type JSONB_PROPERTY_BRAND } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';
import { type RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/remove-suffix.type';
import { ExtractSerializedRelationProperties } from 'twenty-shared/types';

export type ExpandJsonbSerializedRelation<T> = T extends unknown
  ? T extends (infer U)[]
    ? ExpandJsonbSerializedRelation<U>[]
    : HasJsonbPropertyBrand<T> extends true
      ? Omit<
          {
            [P in keyof T]: T[P];
          } & {
            [P in ExtractSerializedRelationProperties<T> &
              string as `${RemoveSuffix<P, 'Id'>}UniversalIdentifier`]: T[P];
          },
          typeof JSONB_PROPERTY_BRAND
        >
      : T
  : never;
