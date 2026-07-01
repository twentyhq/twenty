import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable, CustomError } from 'twenty-shared/utils';

import { type FlatEntityMapsExceptionContext } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export const WorkspaceMigrationRunnerExceptionCode = {
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  EXECUTION_FAILED: 'EXECUTION_FAILED',
  APPLICATION_NOT_FOUND: 'APPLICATION_NOT_FOUND',
  DDL_LOCKED: 'DDL_LOCKED',
} as const;

const getWorkspaceMigrationRunnerExceptionUserFriendlyMessage = (
  code: keyof typeof WorkspaceMigrationRunnerExceptionCode,
) => {
  switch (code) {
    case WorkspaceMigrationRunnerExceptionCode.INTERNAL_SERVER_ERROR:
      return msg`An unexpected error occurred.`;
    case WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED:
      return msg`Migration execution failed.`;
    case WorkspaceMigrationRunnerExceptionCode.APPLICATION_NOT_FOUND:
      return msg`Application not found.`;
    case WorkspaceMigrationRunnerExceptionCode.DDL_LOCKED:
      return msg`Workspace schema changes are temporarily locked.`;
    default:
      assertUnreachable(code);
  }
};

export type WorkspaceMigrationRunnerExecutionErrors = {
  metadata?: Error;
  workspaceSchema?: Error;
  actionTranspilation?: Error;
};

const getActionUniversalIdentifierOrThrow = (
  action: AllUniversalWorkspaceMigrationAction,
): string => {
  if (action.type === 'create') {
    const universalIdentifier = action.flatEntity?.universalIdentifier;

    if (!universalIdentifier) {
      throw new WorkspaceMigrationRunnerException({
        message: `Missing universalIdentifier on create action for '${action.metadataName}'`,
        code: WorkspaceMigrationRunnerExceptionCode.INTERNAL_SERVER_ERROR,
      });
    }

    return universalIdentifier;
  }

  return action.universalIdentifier;
};

const {
  // oxlint-disable-next-line unused-imports/no-unused-vars
  EXECUTION_FAILED: WorkspaceMigrationRunnerExceptionExecutionFailedCode,
  // oxlint-disable-next-line unused-imports/no-unused-vars
  ...WorkspaceMigrationRunnerExceptionCodeOtherCode
} = WorkspaceMigrationRunnerExceptionCode;

type WorkspaceMigrationRunnerExceptionConstructorArgs =
  | {
      message: string;
      code: (typeof WorkspaceMigrationRunnerExceptionCodeOtherCode)[keyof typeof WorkspaceMigrationRunnerExceptionCodeOtherCode];
      userFriendlyMessage?: MessageDescriptor;
      context?: FlatEntityMapsExceptionContext;
    }
  | {
      action: AllUniversalWorkspaceMigrationAction;
      errors: WorkspaceMigrationRunnerExecutionErrors;
      code: typeof WorkspaceMigrationRunnerExceptionExecutionFailedCode;
      userFriendlyMessage?: MessageDescriptor;
    };

export class WorkspaceMigrationRunnerException extends CustomError {
  code: keyof typeof WorkspaceMigrationRunnerExceptionCode;
  userFriendlyMessage: MessageDescriptor;
  action?: AllUniversalWorkspaceMigrationAction;
  errors?: WorkspaceMigrationRunnerExecutionErrors;
  context?: FlatEntityMapsExceptionContext;

  constructor(args: WorkspaceMigrationRunnerExceptionConstructorArgs) {
    if (args.code === WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED) {
      const universalIdentifier = getActionUniversalIdentifierOrThrow(
        args.action,
      );
      const identifierClause = ` (universalIdentifier: ${universalIdentifier})`;

      super(
        `Migration action '${args.action.type}' for '${args.action.metadataName}'${identifierClause} failed`,
      );

      this.code = args.code;
      this.action = args.action;
      this.errors = args.errors;
    } else {
      super(args.message);

      this.code = args.code;
      this.context = args.context;
    }

    this.userFriendlyMessage =
      args.userFriendlyMessage ??
      getWorkspaceMigrationRunnerExceptionUserFriendlyMessage(args.code);
  }
}
