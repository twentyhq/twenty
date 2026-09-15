import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

export const isSystemSideEffectFlatEntity = <T extends AllMetadataName>(
  flatEntity: MetadataUniversalFlatEntity<T>,
): boolean =>
  'isSystemSideEffect' in flatEntity && flatEntity.isSystemSideEffect === true;
