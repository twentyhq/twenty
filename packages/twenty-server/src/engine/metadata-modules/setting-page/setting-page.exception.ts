import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum SettingPageExceptionCode {
  SETTING_PAGE_NOT_FOUND = 'SETTING_PAGE_NOT_FOUND',
  INVALID_SETTING_PAGE_INPUT = 'INVALID_SETTING_PAGE_INPUT',
  SETTING_PAGE_FRONT_COMPONENT_NOT_FOUND = 'SETTING_PAGE_FRONT_COMPONENT_NOT_FOUND',
  SETTING_PAGE_POSITION_ALREADY_TAKEN = 'SETTING_PAGE_POSITION_ALREADY_TAKEN',
  RESERVED_SETTING_PAGE_TITLE = 'RESERVED_SETTING_PAGE_TITLE',
}

const getSettingPageExceptionUserFriendlyMessage = (
  code: SettingPageExceptionCode,
) => {
  switch (code) {
    case SettingPageExceptionCode.SETTING_PAGE_NOT_FOUND:
      return msg`Setting page not found.`;
    case SettingPageExceptionCode.INVALID_SETTING_PAGE_INPUT:
      return msg`Invalid setting page input.`;
    case SettingPageExceptionCode.SETTING_PAGE_FRONT_COMPONENT_NOT_FOUND:
      return msg`The front component this setting page renders was not found.`;
    case SettingPageExceptionCode.SETTING_PAGE_POSITION_ALREADY_TAKEN:
      return msg`Another setting page of this application already uses this position.`;
    case SettingPageExceptionCode.RESERVED_SETTING_PAGE_TITLE:
      return msg`This setting page title is reserved.`;
    default:
      assertUnreachable(code);
  }
};

export class SettingPageException extends CustomException<SettingPageExceptionCode> {
  constructor(
    message: string,
    code: SettingPageExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getSettingPageExceptionUserFriendlyMessage(code),
    });
  }
}
