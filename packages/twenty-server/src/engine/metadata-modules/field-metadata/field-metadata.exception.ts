import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const FieldMetadataExceptionCode = appendCommonExceptionCode({
  FIELD_METADATA_NOT_FOUND: 'FIELD_METADATA_NOT_FOUND',
  INVALID_FIELD_INPUT: 'INVALID_FIELD_INPUT',
  FIELD_MUTATION_NOT_ALLOWED: 'FIELD_MUTATION_NOT_ALLOWED',
  FIELD_ALREADY_EXISTS: 'FIELD_ALREADY_EXISTS',
  OBJECT_METADATA_NOT_FOUND: 'OBJECT_METADATA_NOT_FOUND',
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

// eslint-disable-next-line no-redeclare
export type FieldMetadataExceptionCode =
  (typeof FieldMetadataExceptionCode)[keyof typeof FieldMetadataExceptionCode];

const fieldMetadataExceptionUserFriendlyMessages: Record<
  keyof typeof FieldMetadataExceptionCode,
  MessageDescriptor
> = {
  FIELD_METADATA_NOT_FOUND: msg`Field not found.`,
  INVALID_FIELD_INPUT: msg`Invalid field input.`,
  FIELD_MUTATION_NOT_ALLOWED: msg`This field cannot be modified.`,
  FIELD_ALREADY_EXISTS: msg`A field with this name already exists.`,
  OBJECT_METADATA_NOT_FOUND: msg`Object not found.`,
  FIELD_METADATA_RELATION_NOT_ENABLED: msg`Relation is not enabled for this field.`,
  FIELD_METADATA_RELATION_MALFORMED: msg`Relation configuration is invalid.`,
  LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND: msg`Label identifier field not found.`,
  UNCOVERED_FIELD_METADATA_TYPE_VALIDATION: msg`Field type validation error.`,
  RESERVED_KEYWORD: msg`This name is a reserved keyword.`,
  NOT_AVAILABLE: msg`This field name is not available.`,
  NAME_NOT_SYNCED_WITH_LABEL: msg`Field name is not synced with label.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
};

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
        userFriendlyMessage ?? fieldMetadataExceptionUserFriendlyMessages[code],
    });
  }
}
