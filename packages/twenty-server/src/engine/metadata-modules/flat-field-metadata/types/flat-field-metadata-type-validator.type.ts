import { type FieldMetadataType } from 'twenty-shared/types';

import { type ValidateOneFieldMetadataArgs } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';

export type FlatFieldMetadataTypeValidator = {
  [P in FieldMetadataType]: (
    args: ValidateOneFieldMetadataArgs<P> & { workspaceId: string },
  ) =>
    | FlatFieldMetadataValidationError[]
    | Promise<FlatFieldMetadataValidationError[]>;
};
