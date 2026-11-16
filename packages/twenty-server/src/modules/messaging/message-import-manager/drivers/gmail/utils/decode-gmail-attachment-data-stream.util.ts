import { pipeline, type Readable, Transform } from 'stream';
import { type parser } from 'stream-json';
import pick from 'stream-json/filters/pick.js';

import { GMAIL_ATTACHMENT_BASE64_QUANTUM_LENGTH } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/gmail-attachment-base64-quantum-length.constant';
import { GMAIL_ATTACHMENT_DATA_KEY } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/gmail-attachment-data-key.constant';

export const decodeGmailAttachmentDataStream = (
  responseStream: Readable,
): Readable => {
  let pendingCharacters = '';

  const attachmentDataDecoder = new Transform({
    writableObjectMode: true,
    transform(token: parser.Token, _encoding, callback) {
      if (token.name !== 'stringChunk') {
        return callback();
      }

      const characters = pendingCharacters + token.value;
      const decodableLength =
        characters.length -
        (characters.length % GMAIL_ATTACHMENT_BASE64_QUANTUM_LENGTH);

      pendingCharacters = characters.slice(decodableLength);

      callback(
        null,
        Buffer.from(characters.slice(0, decodableLength), 'base64url'),
      );
    },
    flush(callback) {
      callback(null, Buffer.from(pendingCharacters, 'base64url'));
    },
  });

  return pipeline(
    responseStream,
    pick.withParserAsStream({
      filter: GMAIL_ATTACHMENT_DATA_KEY,
      packStrings: false,
      streamKeys: false,
    }),
    attachmentDataDecoder,
    () => undefined,
  );
};
