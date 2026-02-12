import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export class ViewFieldGroupException extends CustomException<ViewFieldGroupExceptionCode> {
  constructor(
    message: string,
    code: ViewFieldGroupExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`A view field group error occurred.`,
    });
  }
}

export enum ViewFieldGroupExceptionCode {
  VIEW_FIELD_GROUP_NOT_FOUND = 'VIEW_FIELD_GROUP_NOT_FOUND',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
  INVALID_VIEW_FIELD_GROUP_DATA = 'INVALID_VIEW_FIELD_GROUP_DATA',
}
