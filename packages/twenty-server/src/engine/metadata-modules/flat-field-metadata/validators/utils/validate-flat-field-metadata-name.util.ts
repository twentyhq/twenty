import { type FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { runFlatFieldMetadataValidators } from 'src/engine/metadata-modules/flat-field-metadata/utils/run-flat-field-metadata-validators.util';
import { METADATA_NAME_VALIDATORS } from 'src/engine/metadata-modules/utils/constants/metadata-name-flat-metadata-validators.constants';

export const validateFlatFieldMetadataName = (
  name: string,
): FailedFlatFieldMetadataValidationExceptions[] =>
  runFlatFieldMetadataValidators(name, METADATA_NAME_VALIDATORS);
