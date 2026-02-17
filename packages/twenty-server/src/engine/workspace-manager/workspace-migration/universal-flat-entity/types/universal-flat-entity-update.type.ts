import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type MetadataUniversalFlatEntityPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-compare.type';

export type UniversalFlatEntityUpdate<T extends AllMetadataName> = Partial<
  Pick<
    MetadataUniversalFlatEntity<T>,
    MetadataUniversalFlatEntityPropertiesToCompare<T>
  >
>;
