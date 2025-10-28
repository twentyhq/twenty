import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';

export type FlatEntityUpdateValidationArgs<T extends AllMetadataName> = Omit<
  FlatEntityValidationArgs<T>,
  'flatEntityToValidate' | 'remainingFlatEntityMapsToValidate'
> & {
  flatEntityId: string;
  flatEntityUpdates: FlatEntityPropertiesUpdates<T>;
};
