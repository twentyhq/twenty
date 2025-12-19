import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkflowCommonExceptionCode {
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
}

const workflowCommonExceptionUserFriendlyMessages: Record<
  WorkflowCommonExceptionCode,
  MessageDescriptor
> = {
  [WorkflowCommonExceptionCode.OBJECT_METADATA_NOT_FOUND]: msg`Object metadata not found.`,
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
        workflowCommonExceptionUserFriendlyMessages[code],
    });
  }
}
