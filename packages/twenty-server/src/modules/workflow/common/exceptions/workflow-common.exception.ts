import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkflowCommonExceptionCode {
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
}

const getWorkflowCommonExceptionUserFriendlyMessage = (
  code: WorkflowCommonExceptionCode,
) => {
  switch (code) {
    case WorkflowCommonExceptionCode.OBJECT_METADATA_NOT_FOUND:
      return msg`Object metadata not found.`;
    default:
      assertUnreachable(code);
  }
};

export class WorkflowCommonException extends CustomException<WorkflowCommonExceptionCode> {
  constructor(
    message: string,
    code: WorkflowCommonExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getWorkflowCommonExceptionUserFriendlyMessage(code),
    });
  }
}
