/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum RelatedRecordPathExceptionCode {
  RELATED_RECORD_PATH_NOT_FOUND = 'RELATED_RECORD_PATH_NOT_FOUND',
  INVALID_RELATED_RECORD_PATH_INPUT = 'INVALID_RELATED_RECORD_PATH_INPUT',
  RELATED_RECORD_PATHS_NOT_ENTITLED = 'RELATED_RECORD_PATHS_NOT_ENTITLED',
}

const getRelatedRecordPathExceptionUserFriendlyMessage = (
  code: RelatedRecordPathExceptionCode,
) => {
  switch (code) {
    case RelatedRecordPathExceptionCode.RELATED_RECORD_PATH_NOT_FOUND:
      return msg`Related record path not found.`;
    case RelatedRecordPathExceptionCode.INVALID_RELATED_RECORD_PATH_INPUT:
      return msg`Invalid related record path input.`;
    case RelatedRecordPathExceptionCode.RELATED_RECORD_PATHS_NOT_ENTITLED:
      return msg`Related record paths require the Organization plan.`;
    default:
      assertUnreachable(code);
  }
};

export class RelatedRecordPathException extends CustomException<RelatedRecordPathExceptionCode> {
  constructor(
    message: string,
    code: RelatedRecordPathExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getRelatedRecordPathExceptionUserFriendlyMessage(code),
    });
  }
}
