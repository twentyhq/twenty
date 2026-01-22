import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable, CustomError } from 'twenty-shared/utils';

import { type WorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export const WorkspaceMigrationRunnerExceptionCode = {
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  EXECUTION_FAILED: 'EXECUTION_FAILED',
} as const;

const getWorkspaceMigrationRunnerExceptionUserFriendlyMessage = (
  code: keyof typeof WorkspaceMigrationRunnerExceptionCode,
) => {
  switch (code) {
    case WorkspaceMigrationRunnerExceptionCode.INTERNAL_SERVER_ERROR:
      return msg`An unexpected error occurred.`;
    case WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED:
      return msg`Migration execution failed.`;
    default:
      assertUnreachable(code);
  }
};

export type WorkspaceMigrationRunnerExecutionErrors = {
  metadata?: Error;
  workspaceSchema?: Error;
};

type WorkspaceMigrationRunnerExceptionConstructorArgs =
  | {
      message: string;
      code: typeof WorkspaceMigrationRunnerExceptionCode.INTERNAL_SERVER_ERROR;
      userFriendlyMessage?: MessageDescriptor;
    }
  | {
      action: WorkspaceMigrationAction;
      errors: WorkspaceMigrationRunnerExecutionErrors;
      code: typeof WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED;
      userFriendlyMessage?: MessageDescriptor;
    };

export class WorkspaceMigrationRunnerException extends CustomError {
  code: keyof typeof WorkspaceMigrationRunnerExceptionCode;
  userFriendlyMessage: MessageDescriptor;
  action?: WorkspaceMigrationAction;
  errors?: WorkspaceMigrationRunnerExecutionErrors;

  constructor(args: WorkspaceMigrationRunnerExceptionConstructorArgs) {
    if (args.code === WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED) {
      super(
        `Migration action '${args.action.type}' for '${args.action.metadataName}' failed`,
      );

      this.code = args.code;
      this.action = args.action;
      this.errors = args.errors;
    } else {
      super(args.message);

      this.code = args.code;
    }

    this.userFriendlyMessage =
      args.userFriendlyMessage ??
      getWorkspaceMigrationRunnerExceptionUserFriendlyMessage(args.code);
  }
}
