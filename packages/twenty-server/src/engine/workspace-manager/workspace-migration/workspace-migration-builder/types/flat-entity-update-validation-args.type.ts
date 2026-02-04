import { type AllMetadataName } from 'twenty-shared/metadata';

import { FlatEntityUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';

export type FlatEntityUpdateValidationArgs<T extends AllMetadataName> = Omit<
  FlatEntityValidationArgs<T>,
  'flatEntityToValidate' | 'remainingFlatEntityMapsToValidate'
> & {
  flatEntityId: string;
  flatEntityUpdate: FlatEntityUpdate<T>;
  universalIdentifier: string;
};
