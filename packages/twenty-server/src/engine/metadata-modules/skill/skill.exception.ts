import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum SkillExceptionCode {
  SKILL_NOT_FOUND = 'SKILL_NOT_FOUND',
  SKILL_ALREADY_EXISTS = 'SKILL_ALREADY_EXISTS',
  SKILL_IS_STANDARD = 'SKILL_IS_STANDARD',
  INVALID_SKILL_INPUT = 'INVALID_SKILL_INPUT',
}

const getSkillExceptionUserFriendlyMessage = (code: SkillExceptionCode) => {
  switch (code) {
    case SkillExceptionCode.SKILL_NOT_FOUND:
      return msg`Skill not found.`;
    case SkillExceptionCode.SKILL_ALREADY_EXISTS:
      return msg`A skill with this name already exists.`;
    case SkillExceptionCode.SKILL_IS_STANDARD:
      return msg`Standard skills cannot be modified.`;
    case SkillExceptionCode.INVALID_SKILL_INPUT:
      return msg`Invalid skill input.`;
    default:
      assertUnreachable(code);
  }
};

export class SkillException extends CustomException<SkillExceptionCode> {
  constructor(
    message: string,
    code: SkillExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getSkillExceptionUserFriendlyMessage(code),
    });
  }
}
