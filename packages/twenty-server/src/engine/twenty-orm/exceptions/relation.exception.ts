import { type MessageDescriptor } from '@lingui/core';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CustomException } from 'src/utils/custom-exception';

export enum RelationExceptionCode {
  RELATION_OBJECT_METADATA_NOT_FOUND = 'RELATION_OBJECT_METADATA_NOT_FOUND',
  RELATION_TARGET_FIELD_METADATA_ID_NOT_FOUND = 'RELATION_TARGET_FIELD_METADATA_ID_NOT_FOUND',
  RELATION_JOIN_COLUMN_ON_BOTH_SIDES = 'RELATION_JOIN_COLUMN_ON_BOTH_SIDES',
  MISSING_RELATION_JOIN_COLUMN = 'MISSING_RELATION_JOIN_COLUMN',
  MULTIPLE_JOIN_COLUMNS_FOUND = 'MULTIPLE_JOIN_COLUMNS_FOUND',
}

const getRelationExceptionUserFriendlyMessage = (
  code: RelationExceptionCode,
) => {
  switch (code) {
    case RelationExceptionCode.RELATION_OBJECT_METADATA_NOT_FOUND:
    case RelationExceptionCode.RELATION_TARGET_FIELD_METADATA_ID_NOT_FOUND:
    case RelationExceptionCode.RELATION_JOIN_COLUMN_ON_BOTH_SIDES:
    case RelationExceptionCode.MISSING_RELATION_JOIN_COLUMN:
    case RelationExceptionCode.MULTIPLE_JOIN_COLUMNS_FOUND:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};

export class RelationException extends CustomException<RelationExceptionCode> {
  constructor(
    message: string,
    code: RelationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getRelationExceptionUserFriendlyMessage(code),
    });
  }
}
