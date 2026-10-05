import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export const WorkspaceSchemaManagerExceptionCode = appendCommonExceptionCode({
  ENUM_OPERATION_FAILED: 'ENUM_OPERATION_FAILED',
  CONCURRENT_INDEX_CREATION_IN_TRANSACTION:
    'CONCURRENT_INDEX_CREATION_IN_TRANSACTION',
} as const);

const getWorkspaceSchemaManagerExceptionUserFriendlyMessage = (
  code: keyof typeof WorkspaceSchemaManagerExceptionCode,
) => {
  switch (code) {
    case WorkspaceSchemaManagerExceptionCode.CONCURRENT_INDEX_CREATION_IN_TRANSACTION:
      return msg`Could not create the index because it must run outside a database transaction.`;
    case WorkspaceSchemaManagerExceptionCode.ENUM_OPERATION_FAILED:
    case WorkspaceSchemaManagerExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};
const WORKSPACE_SCHEMA_MANAGER_EXCEPTION_CATEGORY_BY_CODE = {
  [WorkspaceSchemaManagerExceptionCode.INTERNAL_SERVER_ERROR]:
    'INTERNAL_SERVER_ERROR',
  [WorkspaceSchemaManagerExceptionCode.ENUM_OPERATION_FAILED]:
    'INTERNAL_SERVER_ERROR',
  [WorkspaceSchemaManagerExceptionCode.CONCURRENT_INDEX_CREATION_IN_TRANSACTION]:
    'INTERNAL_SERVER_ERROR',
} as const satisfies Record<
  keyof typeof WorkspaceSchemaManagerExceptionCode,
  ExceptionCategory
>;

export class WorkspaceSchemaManagerException extends CustomException<
  keyof typeof WorkspaceSchemaManagerExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof WorkspaceSchemaManagerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getWorkspaceSchemaManagerExceptionUserFriendlyMessage(code),
      category: WORKSPACE_SCHEMA_MANAGER_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
