import { type MessageDescriptor } from '@lingui/core';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export const DeferredWorkspaceMigrationActionExceptionCode =
  appendCommonExceptionCode({
    EXECUTION_FAILED: 'EXECUTION_FAILED',
    HANDLER_NOT_FOUND: 'HANDLER_NOT_FOUND',
  } as const);

const getDeferredWorkspaceMigrationActionExceptionUserFriendlyMessage = (
  code: keyof typeof DeferredWorkspaceMigrationActionExceptionCode,
) => {
  switch (code) {
    case DeferredWorkspaceMigrationActionExceptionCode.EXECUTION_FAILED:
    case DeferredWorkspaceMigrationActionExceptionCode.HANDLER_NOT_FOUND:
    case DeferredWorkspaceMigrationActionExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};
const DEFERRED_WORKSPACE_MIGRATION_ACTION_EXCEPTION_CATEGORY_BY_CODE = {
  [DeferredWorkspaceMigrationActionExceptionCode.INTERNAL_SERVER_ERROR]:
    'INTERNAL_SERVER_ERROR',
  [DeferredWorkspaceMigrationActionExceptionCode.EXECUTION_FAILED]:
    'INTERNAL_SERVER_ERROR',
  [DeferredWorkspaceMigrationActionExceptionCode.HANDLER_NOT_FOUND]:
    'INTERNAL_SERVER_ERROR',
} as const satisfies Record<
  keyof typeof DeferredWorkspaceMigrationActionExceptionCode,
  ExceptionCategory
>;

export class DeferredWorkspaceMigrationActionException extends CustomException<
  keyof typeof DeferredWorkspaceMigrationActionExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof DeferredWorkspaceMigrationActionExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getDeferredWorkspaceMigrationActionExceptionUserFriendlyMessage(code),
      category:
        DEFERRED_WORKSPACE_MIGRATION_ACTION_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
