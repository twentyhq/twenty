import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export class ViewTabException extends CustomException<ViewTabExceptionCode> {
  constructor(
    message: string,
    code: ViewTabExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`A view tab error occurred.`,
    });
  }
}

export enum ViewTabExceptionCode {
  VIEW_TAB_NOT_FOUND = 'VIEW_TAB_NOT_FOUND',
  INVALID_VIEW_TAB_DATA = 'INVALID_VIEW_TAB_DATA',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
}
