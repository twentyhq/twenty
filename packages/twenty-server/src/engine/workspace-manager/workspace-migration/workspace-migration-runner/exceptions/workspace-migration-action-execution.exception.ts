import { msg } from '@lingui/core/macro';
import { CustomError } from 'twenty-shared/utils';

import { type WorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export const WorkspaceMigrationActionExecutionExceptionCode = {
  EXECUTION_FAILED: 'EXECUTION_FAILED',
} as const;

export type WorkspaceMigrationActionExecutionErrors = {
  metadata?: Error;
  workspaceSchema?: Error;
};

export class WorkspaceMigrationActionExecutionException extends CustomError {
  code: keyof typeof WorkspaceMigrationActionExecutionExceptionCode;
  userFriendlyMessage = msg`Migration action execution failed.`;
  action: WorkspaceMigrationAction;
  errors: WorkspaceMigrationActionExecutionErrors;

  constructor({
    action,
    errors,
  }: {
    action: WorkspaceMigrationAction;
    errors: WorkspaceMigrationActionExecutionErrors;
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

    this.code = WorkspaceMigrationActionExecutionExceptionCode.EXECUTION_FAILED;
    this.action = action;
    this.errors = errors;
  }
}
