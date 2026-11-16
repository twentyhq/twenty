import { extractImapBodyStructureAttachments } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/extract-imap-body-structure-attachments.util';

describe('extractImapBodyStructureAttachments', () => {
  it('should list attachments with their part path and skip the text bodies', () => {
    expect(
      extractImapBodyStructureAttachments({
        type: 'multipart/mixed',
        childNodes: [
          {
            part: '1',
            type: 'multipart/related',
            childNodes: [
              {
                part: '1.1',
                type: 'multipart/alternative',
                childNodes: [
                  { part: '1.1.1', type: 'text/plain', size: 412 },
                  { part: '1.1.2', type: 'text/html', size: 2210 },
                ],
              },
              {
                part: '1.2',
                type: 'image/png',
                id: '<image001.png@01DA2B3C.4D5E6F70>',
                disposition: 'inline',
                dispositionParameters: { filename: 'image001.png' },
                size: 8216,
              },
            ],
          },
          {
            part: '2',
            type: 'application/pdf',
            encoding: 'base64',
            disposition: 'attachment',
            dispositionParameters: { filename: 'Offer letter.pdf' },
            size: 239860,
          },
          {
            part: '3',
            type: 'text/plain',
            disposition: 'attachment',
            parameters: { name: 'notes.txt' },
            size: 1024,
          },
        ],
      }),
    ).toEqual([
      {
        filename: 'image001.png',
        size: 8216,
        contentType: 'image/png',
        isInline: true,
        externalId: '1.2',
      },
      {
        filename: 'Offer letter.pdf',
        size: 175282,
        contentType: 'application/pdf',
        isInline: false,
        externalId: '2',
      },
      {
        filename: 'notes.txt',
        size: 1024,
        contentType: 'text/plain',
        isInline: false,
        externalId: '3',
      },
    ]);
  });

  it('should walk into a forwarded message but keep an attached message as one file', () => {
    expect(
      extractImapBodyStructureAttachments({
        type: 'multipart/mixed',
        childNodes: [
          { part: '1', type: 'text/plain', size: 120 },
          {
            part: '2',
            type: 'message/rfc822',
            disposition: 'inline',
            childNodes: [
              {
                part: '2',
                type: 'multipart/mixed',
                childNodes: [
                  { part: '2.1', type: 'text/plain', size: 80 },
                  {
                    part: '2.2',
                    type: 'application/octet-stream',
                    size: 4096,
                  },
                ],
              },
            ],
          },
          {
            part: '3',
            type: 'message/rfc822',
            disposition: 'attachment',
            dispositionParameters: { filename: 'Original message.eml' },
            size: 18432,
          },
        ],
      }).map(({ filename, externalId }) => ({ filename, externalId })),
    ).toEqual([
      { filename: 'unnamed-attachment', externalId: '2.2' },
      { filename: 'Original message.eml', externalId: '3' },
    ]);
  });

  it('should keep a named text part that has no attachment disposition', () => {
    expect(
      extractImapBodyStructureAttachments({
        type: 'multipart/mixed',
        childNodes: [
          { part: '1', type: 'text/plain', size: 120 },
          {
            part: '2',
            type: 'text/plain',
            parameters: { name: 'notes.txt' },
            size: 240,
          },
        ],
      }).map(({ filename, externalId }) => ({ filename, externalId })),
    ).toEqual([{ filename: 'notes.txt', externalId: '2' }]);
  });

  it('should use part 1 for a message whose whole body is the attachment', () => {
    expect(
      extractImapBodyStructureAttachments({
        type: 'application/pdf',
        disposition: 'attachment',
        dispositionParameters: { filename: 'scan.pdf' },
        size: 51200,
      }),
    ).toEqual([
      {
        filename: 'scan.pdf',
        size: 51200,
        contentType: 'application/pdf',
        isInline: false,
        externalId: '1',
      },
    ]);
  });
});
