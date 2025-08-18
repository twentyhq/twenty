import { type FailedFlatObjectMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';

// TODO improve error handling from the most atomic source to start
type FailedObjectMetadataValidateAndBuild = {
  status: 'fail';
  // objectMetadataId: string;
  errors: FailedFlatObjectMetadataValidationExceptions[];
};

type FailedFieldMetadataValidateAndBuild = {
  status: 'fail';
  // fieldMetadataId: string;
  // objectMetadataId: string;
  errors: FailedFlatObjectMetadataValidationExceptions[];
};

export type FailedMetadataValidateAndBuild =
  | FailedFieldMetadataValidateAndBuild
  | FailedObjectMetadataValidateAndBuild;
