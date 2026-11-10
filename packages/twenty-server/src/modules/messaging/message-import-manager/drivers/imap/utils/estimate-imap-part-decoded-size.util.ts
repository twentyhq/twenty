import { type MessageStructureObject } from 'imapflow';

import { IMAP_BASE64_DECODED_BYTES_PER_LINE } from 'src/modules/messaging/message-import-manager/drivers/imap/constants/imap-base64-decoded-bytes-per-line.constant';
import { IMAP_BASE64_ENCODED_BYTES_PER_LINE } from 'src/modules/messaging/message-import-manager/drivers/imap/constants/imap-base64-encoded-bytes-per-line.constant';

export const estimateImapPartDecodedSize = (
  part: Pick<MessageStructureObject, 'size' | 'encoding'>,
): number => {
  const encodedSize = part.size ?? 0;

  return part.encoding?.toLowerCase() === 'base64'
    ? Math.floor(
        (encodedSize * IMAP_BASE64_DECODED_BYTES_PER_LINE) /
          IMAP_BASE64_ENCODED_BYTES_PER_LINE,
      )
    : encodedSize;
};
