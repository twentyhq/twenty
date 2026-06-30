import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

export type FlatFieldMetadataTypeValidationArgs<T extends FieldMetadataType> =
  Omit<
    UniversalFlatEntityValidationArgs<'fieldMetadata'> & {
      update?: UniversalFlatEntityUpdate<'fieldMetadata'>;
    },
    'flatEntityToValidate'
  > & {
    flatEntityToValidate: UniversalFlatFieldMetadata<T>;
  };

export type FlatFieldMetadataTypeValidator = {
  [T in FieldMetadataType]: (
    args: FlatFieldMetadataTypeValidationArgs<T>,
  ) => FlatFieldMetadataValidationError[];
};
