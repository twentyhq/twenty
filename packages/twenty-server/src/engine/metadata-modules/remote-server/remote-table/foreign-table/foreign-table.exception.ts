import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum ForeignTableExceptionCode {
  FOREIGN_TABLE_MUTATION_NOT_ALLOWED = 'FOREIGN_TABLE_MUTATION_NOT_ALLOWED',
  INVALID_FOREIGN_TABLE_INPUT = 'INVALID_FOREIGN_TABLE_INPUT',
}

const foreignTableExceptionUserFriendlyMessages: Record<
  ForeignTableExceptionCode,
  MessageDescriptor
> = {
  [ForeignTableExceptionCode.FOREIGN_TABLE_MUTATION_NOT_ALLOWED]: msg`This foreign table cannot be modified.`,
  [ForeignTableExceptionCode.INVALID_FOREIGN_TABLE_INPUT]: msg`Invalid foreign table input.`,
};

export class ForeignTableException extends CustomException<ForeignTableExceptionCode> {
  constructor(
    message: string,
    code: ForeignTableExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? foreignTableExceptionUserFriendlyMessages[code],
    });
  }
}
