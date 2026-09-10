import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

// Role writes run through the workspace migration pipeline, whose exception
// carries a generic message and the actionable per-entity errors in its report.
// Expand it so the model gets something it can correct.
export const toRoleToolErrorMessage = (error: unknown): string => {
  if (error instanceof WorkspaceMigrationBuilderException) {
    return formatValidationErrors(error);
  }

  return error instanceof Error ? error.message : String(error);
};
