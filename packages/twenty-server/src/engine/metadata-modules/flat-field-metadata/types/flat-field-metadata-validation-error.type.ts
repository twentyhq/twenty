import { type MessageDescriptor } from '@lingui/core';

import { type FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

export type FlatFieldMetadataValidationError = {
  code: FieldMetadataExceptionCode;
  message: string;
  userFriendlyMessage?: MessageDescriptor;
  value?: unknown;
};
