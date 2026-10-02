import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

// Migration pipeline exceptions carry a generic message; the actionable per-entity errors are in the report
export const toRoleToolErrorMessage = (error: unknown): string => {
  if (error instanceof WorkspaceMigrationBuilderException) {
    return formatValidationErrors(error);
  }

  return error instanceof Error ? error.message : String(error);
};
