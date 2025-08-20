import { type FailedFlatFieldMetadataValidation } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { type ObjectMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-object-metadata/types/object-metadata-minimal-information.type';
import { type WorkspaceMigrationObjectActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';

export type FailedFlatObjectMetadataValidation = {
  type: WorkspaceMigrationObjectActionTypeV2;
  objectLevelErrors: FlatObjectMetadataValidationError[];
  fieldLevelErrors: FailedFlatFieldMetadataValidation[];
  objectMinimalInformation: Partial<ObjectMetadataMinimalInformation>;
};
