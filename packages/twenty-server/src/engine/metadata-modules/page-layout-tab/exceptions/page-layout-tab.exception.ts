import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum PageLayoutTabExceptionCode {
  PAGE_LAYOUT_TAB_NOT_FOUND = 'PAGE_LAYOUT_TAB_NOT_FOUND',
  INVALID_PAGE_LAYOUT_TAB_DATA = 'INVALID_PAGE_LAYOUT_TAB_DATA',
}

export enum PageLayoutTabExceptionMessageKey {
  PAGE_LAYOUT_TAB_NOT_FOUND = 'PAGE_LAYOUT_TAB_NOT_FOUND',
  TITLE_REQUIRED = 'TITLE_REQUIRED',
  PAGE_LAYOUT_ID_REQUIRED = 'PAGE_LAYOUT_ID_REQUIRED',
  PAGE_LAYOUT_NOT_FOUND = 'PAGE_LAYOUT_NOT_FOUND',
  PAGE_LAYOUT_TAB_NOT_DELETED = 'PAGE_LAYOUT_TAB_NOT_DELETED',
}

const getPageLayoutTabExceptionUserFriendlyMessage = (
  code: PageLayoutTabExceptionCode,
) => {
  switch (code) {
    case PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND:
      return msg`Page layout tab not found.`;
    case PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA:
      return msg`Invalid page layout tab data.`;
    default:
      assertUnreachable(code);
  }
};
const PAGE_LAYOUT_TAB_EXCEPTION_CATEGORY_BY_CODE = {
  [PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND]: 'NOT_FOUND',
  [PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA]: 'BAD_USER_INPUT',
} as const satisfies Record<PageLayoutTabExceptionCode, ExceptionCategory>;

export class PageLayoutTabException extends CustomException<PageLayoutTabExceptionCode> {
  constructor(
    message: string,
    code: PageLayoutTabExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getPageLayoutTabExceptionUserFriendlyMessage(code),
      category: PAGE_LAYOUT_TAB_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}

export const generatePageLayoutTabExceptionMessage = (
  key: PageLayoutTabExceptionMessageKey,
  value?: string,
): string => {
  switch (key) {
    case PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND:
      return `Page layout tab with ID "${value}" not found`;
    case PageLayoutTabExceptionMessageKey.TITLE_REQUIRED:
      return 'Page layout tab title is required';
    case PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_ID_REQUIRED:
      return 'Page layout ID is required';
    case PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND:
      return 'Page layout not found';
    case PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_DELETED:
      return 'Page layout tab is not deleted and cannot be restored';
    default:
      assertUnreachable(key);
  }
};
