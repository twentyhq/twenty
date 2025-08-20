import { FailedFlatObjectMetadataValidation } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';

export const getDefaultObjectMetadataValidationType = (
  overrides: Partial<Omit<FailedFlatObjectMetadataValidation, 'type'>>,
): FailedFlatObjectMetadataValidation => ({
  fieldLevelErrors: [],
  objectLevelErrors: [],
  objectMinimalInformation: {},
  ...overrides,
  type: 'object',
});
