import { randomBytes } from 'crypto';
import { Readable } from 'stream';

import { decodeGmailAttachmentDataStream } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/decode-gmail-attachment-data-stream.util';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const splitIntoChunks = (text: string, chunkLength: number): Buffer[] =>
  Array.from({ length: Math.ceil(text.length / chunkLength) }, (_, index) =>
    Buffer.from(text.slice(index * chunkLength, (index + 1) * chunkLength)),
  );

describe('decodeGmailAttachmentDataStream', () => {
  it('should decode the attachment bytes when the response arrives in uneven chunks', async () => {
    const attachmentContent = randomBytes(100003);
    const gmailResponse = JSON.stringify({
      size: attachmentContent.length,
      data: attachmentContent.toString('base64url'),
    });

    const decodedContent = await streamToBuffer(
      decodeGmailAttachmentDataStream(
        Readable.from(splitIntoChunks(gmailResponse, 1021)),
      ),
    );

    expect(decodedContent.equals(attachmentContent)).toBe(true);
  });

  it('should produce no bytes when the response has no attachment data', async () => {
    const decodedContent = await streamToBuffer(
      decodeGmailAttachmentDataStream(
        Readable.from([Buffer.from(JSON.stringify({ size: 0 }))]),
      ),
    );

    expect(decodedContent.length).toBe(0);
  });
});
