import { isNonEmptyString } from '@sniptt/guards';
import { lookup } from 'mrmime';

import { normalizeMessageAttachmentContentType } from 'src/modules/messaging/message-import-manager/utils/normalize-message-attachment-content-type.util';

const GENERIC_MIME_TYPE = 'application/octet-stream';

export const resolveMessageAttachmentMimeType = ({
  contentType,
  filename,
}: {
  contentType: string;
  filename: string;
}): string => {
  const normalizedContentType =
    normalizeMessageAttachmentContentType(contentType);

  if (
    isNonEmptyString(normalizedContentType) &&
    normalizedContentType !== GENERIC_MIME_TYPE
  ) {
    return normalizedContentType;
  }

  const mimeTypeFromFilename = lookup(filename);

  return isNonEmptyString(mimeTypeFromFilename)
    ? mimeTypeFromFilename
    : GENERIC_MIME_TYPE;
};
