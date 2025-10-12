import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';

export type FlatFieldMetadataTypeValidationArgs<T extends FieldMetadataType> =
  Omit<FlatEntityValidationArgs<'fieldMetadata'>, 'flatEntityToValidate'> & {
    flatEntityToValidate: FlatFieldMetadata<T>;
  };

export type FlatFieldMetadataTypeValidator = {
  [T in FieldMetadataType]: (
    args: FlatFieldMetadataTypeValidationArgs<T>,
  ) =>
    | FlatFieldMetadataValidationError[]
    | Promise<FlatFieldMetadataValidationError[]>;
};
