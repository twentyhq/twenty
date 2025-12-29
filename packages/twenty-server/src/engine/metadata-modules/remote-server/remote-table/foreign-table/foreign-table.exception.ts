import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ForeignTableExceptionCode {
  FOREIGN_TABLE_MUTATION_NOT_ALLOWED = 'FOREIGN_TABLE_MUTATION_NOT_ALLOWED',
  INVALID_FOREIGN_TABLE_INPUT = 'INVALID_FOREIGN_TABLE_INPUT',
}

const getForeignTableExceptionUserFriendlyMessage = (
  code: ForeignTableExceptionCode,
) => {
  switch (code) {
    case ForeignTableExceptionCode.FOREIGN_TABLE_MUTATION_NOT_ALLOWED:
      return msg`This foreign table cannot be modified.`;
    case ForeignTableExceptionCode.INVALID_FOREIGN_TABLE_INPUT:
      return msg`Invalid foreign table input.`;
    default:
      assertUnreachable(code);
  }
};

export class ForeignTableException extends CustomException<ForeignTableExceptionCode> {
  constructor(
    message: string,
    code: ForeignTableExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getForeignTableExceptionUserFriendlyMessage(code),
    });
  }
}
