import { type gmail_v1 as gmailV1 } from 'googleapis';

import { getAttachmentData } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/get-attachment-data.util';

const encode = (text: string) => Buffer.from(text).toString('base64url');

const makeMessage = (
  payload: gmailV1.Schema$MessagePart | undefined,
): gmailV1.Schema$Message => ({ payload });

const alternativeBodyPart: gmailV1.Schema$MessagePart = {
  partId: '0',
  mimeType: 'multipart/alternative',
  filename: '',
  parts: [
    {
      partId: '0.0',
      mimeType: 'text/plain',
      filename: '',
      body: { data: encode('See attached'), size: 12 },
    },
    {
      partId: '0.1',
      mimeType: 'text/html',
      filename: '',
      body: { data: encode('<p>See attached</p>'), size: 19 },
    },
  ],
};

describe('getAttachmentData', () => {
  it('should return an empty list when payload is missing', () => {
    expect(getAttachmentData(makeMessage(undefined))).toEqual([]);
  });

  it('should return top-level attachment metadata with the attachment id', () => {
    const message = makeMessage({
      partId: '',
      mimeType: 'multipart/mixed',
      filename: '',
      parts: [
        alternativeBodyPart,
        {
          partId: '1',
          mimeType: 'application/pdf',
          filename: 'invoice.pdf',
          headers: [
            {
              name: 'Content-Disposition',
              value: 'attachment; filename="invoice.pdf"',
            },
          ],
          body: { attachmentId: 'attachment-invoice', size: 48213 },
        },
      ],
    });

    expect(getAttachmentData(message)).toEqual([
      {
        externalId: '1',
        filename: 'invoice.pdf',
        size: 48213,
        contentType: 'application/pdf',
        isInline: false,
        attachmentId: 'attachment-invoice',
      },
    ]);
  });

  it('should list nested attachments depth first, in MIME order', () => {
    const message = makeMessage({
      partId: '',
      mimeType: 'multipart/mixed',
      filename: '',
      parts: [
        alternativeBodyPart,
        {
          partId: '1',
          mimeType: 'multipart/mixed',
          filename: '',
          parts: [
            {
              partId: '1.0',
              mimeType: 'text/plain',
              filename: '',
              body: { data: encode('Forwarded'), size: 9 },
            },
            {
              partId: '1.1',
              mimeType:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              filename: 'forecast.xlsx',
              headers: [
                {
                  name: 'content-disposition',
                  value: 'attachment; filename="forecast.xlsx"',
                },
              ],
              body: { attachmentId: 'attachment-forecast', size: 10240 },
            },
          ],
        },
        {
          partId: '2',
          mimeType: 'application/zip',
          filename: 'assets.zip',
          body: { attachmentId: 'attachment-assets', size: 802816 },
        },
      ],
    });

    expect(getAttachmentData(message).map(({ filename }) => filename)).toEqual([
      'forecast.xlsx',
      'assets.zip',
    ]);
  });

  it('should flag parts with a content id or an inline disposition as inline', () => {
    const message = makeMessage({
      partId: '',
      mimeType: 'multipart/mixed',
      filename: '',
      parts: [
        {
          partId: '0',
          mimeType: 'multipart/related',
          filename: '',
          parts: [
            alternativeBodyPart,
            {
              partId: '0.1',
              mimeType: 'image/png',
              filename: 'logo.png',
              headers: [{ name: 'Content-ID', value: '<logo@example.com>' }],
              body: { attachmentId: 'attachment-logo', size: 2048 },
            },
          ],
        },
        {
          partId: '1',
          mimeType: 'image/jpeg',
          filename: 'photo.jpg',
          headers: [
            {
              name: 'Content-Disposition',
              value: 'inline; filename="photo.jpg"',
            },
          ],
          body: { attachmentId: 'attachment-photo', size: 512000 },
        },
        {
          partId: '2',
          mimeType: 'image/jpeg',
          filename: 'floor-plan.jpg',
          headers: [
            {
              name: 'Content-Disposition',
              value: 'attachment; filename="floor-plan.jpg"',
            },
          ],
          body: { attachmentId: 'attachment-floor-plan', size: 734003 },
        },
      ],
    });

    expect(
      getAttachmentData(message).map(({ filename, isInline }) => ({
        filename,
        isInline,
      })),
    ).toEqual([
      { filename: 'logo.png', isInline: true },
      { filename: 'photo.jpg', isInline: true },
      { filename: 'floor-plan.jpg', isInline: false },
    ]);
  });

  it('should skip parts that carry inline body data instead of an attachment id', () => {
    const message = makeMessage({
      partId: '',
      mimeType: 'multipart/mixed',
      filename: '',
      parts: [
        {
          partId: '0',
          mimeType: 'text/calendar',
          filename: 'invite.ics',
          body: { data: encode('BEGIN:VCALENDAR'), size: 15 },
        },
      ],
    });

    expect(getAttachmentData(message)).toEqual([]);
  });
});
