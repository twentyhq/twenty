import { type MessageDescriptor } from '@lingui/core';

import { type ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

export type FlatObjectMetadataValidationError = {
  code: ObjectMetadataExceptionCode;
  message: string;
  userFriendlyMessage?: MessageDescriptor;
  value?: unknown;
};
