import { type AllMetadataName } from 'twenty-shared/metadata';

import { type WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export const getEmptyFlatEntityValidationError = <
  TMetadataName extends AllMetadataName,
  TActionType extends WorkspaceMigrationActionType,
>({
  metadataName,
  flatEntityMinimalInformation,
  type,
}: Pick<
  FailedFlatEntityValidation<TMetadataName, TActionType>,
  'metadataName' | 'flatEntityMinimalInformation' | 'type'
>): FailedFlatEntityValidation<TMetadataName, TActionType> => {
  return {
    errors: [],
    flatEntityMinimalInformation,
    metadataName,
    type,
  };
};
