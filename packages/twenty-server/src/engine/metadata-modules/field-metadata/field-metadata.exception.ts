import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export const FieldMetadataExceptionCode = appendCommonExceptionCode({
  FIELD_METADATA_NOT_FOUND: 'FIELD_METADATA_NOT_FOUND',
  INVALID_FIELD_INPUT: 'INVALID_FIELD_INPUT',
  FIELD_MUTATION_NOT_ALLOWED: 'FIELD_MUTATION_NOT_ALLOWED',
  FIELD_ALREADY_EXISTS: 'FIELD_ALREADY_EXISTS',
  OBJECT_METADATA_NOT_FOUND: 'OBJECT_METADATA_NOT_FOUND',
  APPLICATION_NOT_FOUND: 'APPLICATION_NOT_FOUND',
  FIELD_METADATA_RELATION_NOT_ENABLED: 'FIELD_METADATA_RELATION_NOT_ENABLED',
  FIELD_METADATA_RELATION_MALFORMED: 'FIELD_METADATA_RELATION_MALFORMED',
  LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND:
    'LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND',
  UNCOVERED_FIELD_METADATA_TYPE_VALIDATION:
    'UNCOVERED_FIELD_METADATA_TYPE_VALIDATION',
  RESERVED_KEYWORD: 'RESERVED_KEYWORD',
  NOT_AVAILABLE: 'NOT_AVAILABLE',
  NAME_NOT_SYNCED_WITH_LABEL: 'NAME_NOT_SYNCED_WITH_LABEL',
} as const);

// oxlint-disable-next-line no-redeclare
export type FieldMetadataExceptionCode =
  (typeof FieldMetadataExceptionCode)[keyof typeof FieldMetadataExceptionCode];

const getFieldMetadataExceptionUserFriendlyMessage = (
  code: keyof typeof FieldMetadataExceptionCode,
) => {
  switch (code) {
    case FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND:
      return msg`Field not found.`;
    case FieldMetadataExceptionCode.INVALID_FIELD_INPUT:
      return msg`Invalid field input.`;
    case FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED:
      return msg`This field cannot be modified.`;
    case FieldMetadataExceptionCode.FIELD_ALREADY_EXISTS:
      return msg`A field with this name already exists.`;
    case FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND:
      return msg`Object not found.`;
    case FieldMetadataExceptionCode.APPLICATION_NOT_FOUND:
      return msg`Application not found.`;
    case FieldMetadataExceptionCode.FIELD_METADATA_RELATION_NOT_ENABLED:
      return msg`Relation is not enabled for this field.`;
    case FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED:
      return msg`Relation configuration is invalid.`;
    case FieldMetadataExceptionCode.LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND:
      return msg`Label identifier field not found.`;
    case FieldMetadataExceptionCode.UNCOVERED_FIELD_METADATA_TYPE_VALIDATION:
      return msg`Field type validation error.`;
    case FieldMetadataExceptionCode.RESERVED_KEYWORD:
      return msg`This name is a reserved keyword.`;
    case FieldMetadataExceptionCode.NOT_AVAILABLE:
      return msg`This field name is not available.`;
    case FieldMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL:
      return msg`Field name is not synced with label.`;
    case FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};
const FIELD_METADATA_EXCEPTION_CATEGORY_BY_CODE = {
  [FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
  [FieldMetadataExceptionCode.APPLICATION_NOT_FOUND]: 'BAD_USER_INPUT',
  [FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND]: 'NOT_FOUND',
  [FieldMetadataExceptionCode.INVALID_FIELD_INPUT]: 'BAD_USER_INPUT',
  [FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED]: 'FORBIDDEN',
  [FieldMetadataExceptionCode.FIELD_ALREADY_EXISTS]: 'CONFLICT',
  [FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND]: 'BAD_USER_INPUT',
  [FieldMetadataExceptionCode.FIELD_METADATA_RELATION_NOT_ENABLED]:
    'BAD_USER_INPUT',
  [FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED]:
    'BAD_USER_INPUT',
  [FieldMetadataExceptionCode.LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND]:
    'BAD_USER_INPUT',
  [FieldMetadataExceptionCode.UNCOVERED_FIELD_METADATA_TYPE_VALIDATION]:
    'BAD_USER_INPUT',
  [FieldMetadataExceptionCode.RESERVED_KEYWORD]: 'BAD_USER_INPUT',
  [FieldMetadataExceptionCode.NOT_AVAILABLE]: 'BAD_USER_INPUT',
  [FieldMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL]: 'BAD_USER_INPUT',
} as const satisfies Record<
  keyof typeof FieldMetadataExceptionCode,
  ExceptionCategory
>;

export class FieldMetadataException extends CustomException<
  keyof typeof FieldMetadataExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof FieldMetadataExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getFieldMetadataExceptionUserFriendlyMessage(code),
      category: FIELD_METADATA_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
