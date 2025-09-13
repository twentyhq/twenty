import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export const getDefaultFailedFlatObjectMetadataValidation = (
  overrides: Partial<
    Omit<FailedFlatEntityValidation<FlatObjectMetadata>, 'type'>
  > &
    Pick<FailedFlatEntityValidation<FlatObjectMetadata>, 'type'>,
): FailedFlatEntityValidation<FlatObjectMetadata> => ({
  errors: [],
  flatEntityMinimalInformation: {},
  ...overrides,
});
