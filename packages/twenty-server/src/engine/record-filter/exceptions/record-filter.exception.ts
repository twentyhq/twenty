import { type MessageDescriptor } from '@lingui/core';

import { CustomException } from 'src/utils/custom-exception';

export enum RecordFilterExceptionCode {
  INVALID_QUERY_INPUT = 'INVALID_QUERY_INPUT',
  UNSUPPORTED_OPERATOR = 'UNSUPPORTED_OPERATOR',
}

export class RecordFilterException extends CustomException<RecordFilterExceptionCode> {
  constructor({
    message,
    code,
    userFriendlyMessage,
  }: {
    message: string;
    code: RecordFilterExceptionCode;
    userFriendlyMessage: MessageDescriptor;
  }) {
    super(message, code, {
      userFriendlyMessage,
    });
  }
}
