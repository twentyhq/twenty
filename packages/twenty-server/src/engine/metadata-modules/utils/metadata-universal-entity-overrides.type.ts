import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type JSONB_PROPERTY_BRAND } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

export type MetadataUniversalEntityOverrides<T extends AllMetadataName> =
  MetadataUniversalFlatEntity<T> extends {
    universalOverrides: infer TUniversalOverrides;
  }
    ? Omit<NonNullable<TUniversalOverrides>, typeof JSONB_PROPERTY_BRAND>
    : never;
