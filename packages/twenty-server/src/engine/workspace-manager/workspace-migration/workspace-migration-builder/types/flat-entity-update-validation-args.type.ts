import { type AllMetadataName } from 'twenty-shared/metadata';

import { UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';

export type FlatEntityUpdateValidationArgs<T extends AllMetadataName> = Omit<
  FlatEntityValidationArgs<T>,
  'flatEntityToValidate' | 'remainingFlatEntityMapsToValidate'
> & {
  flatEntityId: string;
  flatEntityUpdate: UniversalFlatEntityUpdate<T>;
  universalIdentifier: string;
};
