import { type FailedFlatObjectMetadataValidation } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';

export const getDefaultFailedFlatObjectMetadataValidation = (
  overrides: Partial<Omit<FailedFlatObjectMetadataValidation, 'type'>> &
    Pick<FailedFlatObjectMetadataValidation, 'type'>,
): FailedFlatObjectMetadataValidation => ({
  fieldLevelErrors: [],
  objectLevelErrors: [],
  objectMinimalInformation: {},
  ...overrides,
});
