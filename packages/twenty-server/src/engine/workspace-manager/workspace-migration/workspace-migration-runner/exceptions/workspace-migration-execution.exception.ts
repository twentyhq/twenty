import { msg } from '@lingui/core/macro';
import { CustomError } from 'twenty-shared/utils';

import { WorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export const WorkspaceMigrationExecutionExceptionCode = {
  EXECUTION_FAILED: 'EXECUTION_FAILED',
} as const;

export type WorkspaceMigrationExecutionErrors = {
  metadata?: Error;
  workspaceSchema?: Error;
};

export class WorkspaceMigrationExecutionException extends CustomError {
  code: keyof typeof WorkspaceMigrationExecutionExceptionCode;
  userFriendlyMessage = msg`Migration action execution failed.`;
  action: WorkspaceMigrationAction;
  errors: WorkspaceMigrationExecutionErrors;

  constructor({
    action,
    errors,
  }: {
    action: WorkspaceMigrationAction;
    errors: WorkspaceMigrationExecutionErrors;
  }) {
    const errorMessages: string[] = [];

    if (errors.metadata) {
      errorMessages.push(`Metadata: ${errors.metadata.message}`);
    }
    if (errors.workspaceSchema) {
      errorMessages.push(`WorkspaceSchema: ${errors.workspaceSchema.message}`);
    }

    super(
      `Migration action '${action.type}' for '${action.metadataName}' failed. ${errorMessages.join(', ')}`,
    );

    this.code = WorkspaceMigrationExecutionExceptionCode.EXECUTION_FAILED;
    this.action = action;
    this.errors = errors;
  }
}
