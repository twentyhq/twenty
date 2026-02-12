import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  SkillException,
  SkillExceptionCode,
} from 'src/engine/metadata-modules/skill/skill.exception';

export const skillGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof SkillException) {
    switch (error.code) {
      case SkillExceptionCode.SKILL_NOT_FOUND:
        throw new NotFoundError(error);
      case SkillExceptionCode.INVALID_SKILL_INPUT:
        throw new UserInputError(error);
      case SkillExceptionCode.SKILL_ALREADY_EXISTS:
        throw new ConflictError(error);
      case SkillExceptionCode.SKILL_IS_STANDARD:
        throw new ForbiddenError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
