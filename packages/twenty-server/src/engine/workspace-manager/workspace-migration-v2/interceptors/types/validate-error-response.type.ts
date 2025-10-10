import { type AllFlatEntitiesByMetadataEngineName } from 'src/engine/core-modules/common/types/all-flat-entities-by-metadata-engine-name.type';
import { type FieldMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-field-metadata/types/field-metadata-minimal-information.type';
import { type ObjectMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-object-metadata/types/object-metadata-minimal-information.type';
import { type OrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { type TranslatedFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/utils/translate-validation-errors.util';
import { type WorkspaceMigrationFieldActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { type WorkspaceMigrationObjectActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';

export type ValidationErrorFieldResponse =
  Partial<FieldMetadataMinimalInformation> & {
    operation: WorkspaceMigrationFieldActionTypeV2;
    errors: TranslatedFlatEntityValidationError[];
  };
export type ValidationErrorObjectResponse =
  Partial<ObjectMetadataMinimalInformation> & {
    operation: WorkspaceMigrationObjectActionTypeV2;
    errors: TranslatedFlatEntityValidationError[];
    fields: ValidationErrorFieldResponse[];
  };

export type ValidationErrorResponse = {
  summary: {
    totalErrors: number;
  } & {
    [P in keyof AllFlatEntitiesByMetadataEngineName as `invalid${Capitalize<P>}`]: number;
  };
  errors: OrchestratorFailureReport;
};
