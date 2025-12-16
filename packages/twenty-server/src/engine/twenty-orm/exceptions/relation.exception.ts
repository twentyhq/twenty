import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum RelationExceptionCode {
  RELATION_OBJECT_METADATA_NOT_FOUND = 'RELATION_OBJECT_METADATA_NOT_FOUND',
  RELATION_TARGET_FIELD_METADATA_ID_NOT_FOUND = 'RELATION_TARGET_FIELD_METADATA_ID_NOT_FOUND',
  RELATION_JOIN_COLUMN_ON_BOTH_SIDES = 'RELATION_JOIN_COLUMN_ON_BOTH_SIDES',
  MISSING_RELATION_JOIN_COLUMN = 'MISSING_RELATION_JOIN_COLUMN',
  MULTIPLE_JOIN_COLUMNS_FOUND = 'MULTIPLE_JOIN_COLUMNS_FOUND',
}

const relationExceptionUserFriendlyMessages: Record<
  RelationExceptionCode,
  MessageDescriptor
> = {
  [RelationExceptionCode.RELATION_OBJECT_METADATA_NOT_FOUND]: msg`Relation object not found.`,
  [RelationExceptionCode.RELATION_TARGET_FIELD_METADATA_ID_NOT_FOUND]: msg`Relation target field not found.`,
  [RelationExceptionCode.RELATION_JOIN_COLUMN_ON_BOTH_SIDES]: msg`Relation has join column on both sides.`,
  [RelationExceptionCode.MISSING_RELATION_JOIN_COLUMN]: msg`Missing relation join column.`,
  [RelationExceptionCode.MULTIPLE_JOIN_COLUMNS_FOUND]: msg`Multiple join columns found.`,
};

export class RelationException extends CustomException<RelationExceptionCode> {
  constructor(
    message: string,
    code: RelationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? relationExceptionUserFriendlyMessages[code],
    });
  }
}
