import { type FieldMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-field-metadata/types/field-metadata-minimal-information.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type WorkspaceMigrationFieldActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';

export type FailedFlatFieldMetadataValidation = {
  type: WorkspaceMigrationFieldActionTypeV2;
  errors: FlatFieldMetadataValidationError[];
  fieldMinimalInformation: Partial<FieldMetadataMinimalInformation>;
};
