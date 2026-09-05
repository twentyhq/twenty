import { assertUnreachable } from 'twenty-shared/utils';

import {
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type SharingRuleException,
  SharingRuleExceptionCode,
} from 'src/engine/metadata-modules/sharing-rule/exceptions/sharing-rule.exception';

export const sharingRuleGraphqlApiExceptionHandler = (
  error: SharingRuleException,
) => {
  switch (error.code) {
    case SharingRuleExceptionCode.INVALID_SHARING_RULE_INPUT:
      throw new UserInputError(error);
    case SharingRuleExceptionCode.SHARING_RULE_NOT_FOUND:
    case SharingRuleExceptionCode.OBJECT_METADATA_NOT_FOUND:
    case SharingRuleExceptionCode.ROLE_NOT_FOUND:
      throw new NotFoundError(error);
    case SharingRuleExceptionCode.INTERNAL_SERVER_ERROR:
      throw new InternalServerError(error);
    default: {
      return assertUnreachable(error.code);
    }
  }
};
