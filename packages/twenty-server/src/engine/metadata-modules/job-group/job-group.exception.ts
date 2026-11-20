import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum JobGroupExceptionCode {
  JOB_GROUP_NOT_FOUND = 'JOB_GROUP_NOT_FOUND',
  INVALID_JOB_GROUP_INPUT = 'INVALID_JOB_GROUP_INPUT',
}

const getJobGroupExceptionUserFriendlyMessage = (
  code: JobGroupExceptionCode,
) => {
  switch (code) {
    case JobGroupExceptionCode.JOB_GROUP_NOT_FOUND:
      return msg`Job group not found.`;
    case JobGroupExceptionCode.INVALID_JOB_GROUP_INPUT:
      return msg`Invalid job group input.`;
    default:
      assertUnreachable(code);
  }
};

export class JobGroupException extends CustomException<JobGroupExceptionCode> {
  constructor(
    message: string,
    code: JobGroupExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getJobGroupExceptionUserFriendlyMessage(code),
    });
  }
}
