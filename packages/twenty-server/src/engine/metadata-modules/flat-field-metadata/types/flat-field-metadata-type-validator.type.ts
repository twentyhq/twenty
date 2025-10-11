import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type ValidateOneFieldMetadataArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-field-metadata-validator.service';

export type FlatFieldMetadataTypeValidator = {
  [P in FieldMetadataType]: (
    args: ValidateOneFieldMetadataArgs<P> & { workspaceId: string },
  ) =>
    | FlatFieldMetadataValidationError[]
    | Promise<FlatFieldMetadataValidationError[]>;
};
