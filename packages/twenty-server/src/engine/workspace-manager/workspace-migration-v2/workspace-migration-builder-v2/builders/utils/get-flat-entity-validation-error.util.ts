import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { AllMetadataName } from 'twenty-shared/metadata';

export const getEmptyFlatEntityValidationError = <T extends AllMetadataName>({
  metadataName,
  flatEntityMinimalInformation,
  type,
}: Pick<
  FailedFlatEntityValidation<T>,
  'metadataName' | 'flatEntityMinimalInformation' | 'type'
>): FailedFlatEntityValidation<T> => {
  return {
    errors: [],
    flatEntityMinimalInformation,
    metadataName,
    type,
  };
};
