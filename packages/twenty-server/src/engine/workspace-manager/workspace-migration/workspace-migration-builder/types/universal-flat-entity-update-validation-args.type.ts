import { type AllMetadataName } from 'twenty-shared/metadata';

import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

export type FlatEntityUpdateValidationArgs<T extends AllMetadataName> = Omit<
  UniversalFlatEntityValidationArgs<T>,
  'flatEntityToValidate' | 'remainingFlatEntityMapsToValidate'
> & {
  finalFlatEntityMaps: MetadataUniversalFlatEntityMaps<T>;
  flatEntityUpdate: UniversalFlatEntityUpdate<T>;
  universalIdentifier: string;
};
