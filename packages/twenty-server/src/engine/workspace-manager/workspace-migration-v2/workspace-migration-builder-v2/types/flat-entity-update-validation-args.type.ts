import { type FromTo } from 'twenty-shared/types';

import {
  FlatEntityPropertiesUpdates,
  type MetadataFlatEntityMaps,
} from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';

export type FlatEntityUpdateValidationArgs<T extends AllMetadataName> = Omit<
  FlatEntityValidationArgs<T>,
  'flatEntityToValidate' | 'remainingFlatEntityMapsToValidate'
> & {
  flatEntityId: string
  flatEntityUpdates: FlatEntityPropertiesUpdates<T>;
  remainingFlatEntityMapsToValidate: FromTo<MetadataFlatEntityMaps<T>>;
};
