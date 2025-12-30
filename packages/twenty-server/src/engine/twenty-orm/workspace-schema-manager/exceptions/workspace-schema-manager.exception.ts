import { type MessageDescriptor } from '@lingui/core';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const WorkspaceSchemaManagerExceptionCode = appendCommonExceptionCode({
  ENUM_OPERATION_FAILED: 'ENUM_OPERATION_FAILED',
} as const);

const getWorkspaceSchemaManagerExceptionUserFriendlyMessage = (
  code: keyof typeof WorkspaceSchemaManagerExceptionCode,
) => {
  switch (code) {
    case WorkspaceSchemaManagerExceptionCode.ENUM_OPERATION_FAILED:
    case WorkspaceSchemaManagerExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};

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
    });
  }
}
