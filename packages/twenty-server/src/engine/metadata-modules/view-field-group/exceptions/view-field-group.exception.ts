import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export class ViewFieldGroupException extends CustomException<ViewFieldGroupExceptionCode> {
  constructor(
    message: string,
    code: ViewFieldGroupExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`A view field group error occurred.`,
      category: VIEW_FIELD_GROUP_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}

export enum ViewFieldGroupExceptionCode {
  VIEW_FIELD_GROUP_NOT_FOUND = 'VIEW_FIELD_GROUP_NOT_FOUND',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
  FIELDS_WIDGET_NOT_FOUND = 'FIELDS_WIDGET_NOT_FOUND',
  INVALID_VIEW_FIELD_GROUP_DATA = 'INVALID_VIEW_FIELD_GROUP_DATA',
}
const VIEW_FIELD_GROUP_EXCEPTION_CATEGORY_BY_CODE = {
  [ViewFieldGroupExceptionCode.VIEW_FIELD_GROUP_NOT_FOUND]: 'NOT_FOUND',
  [ViewFieldGroupExceptionCode.VIEW_NOT_FOUND]: 'NOT_FOUND',
  [ViewFieldGroupExceptionCode.FIELDS_WIDGET_NOT_FOUND]: 'NOT_FOUND',
  [ViewFieldGroupExceptionCode.INVALID_VIEW_FIELD_GROUP_DATA]: 'BAD_USER_INPUT',
} as const satisfies Record<ViewFieldGroupExceptionCode, ExceptionCategory>;
