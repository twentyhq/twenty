import { type gmail_v1 as gmailV1 } from 'googleapis';

import { getBodyData } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/get-body-data.util';

const encode = (text: string) => Buffer.from(text).toString('base64url');

const makeMessage = (
  payload: gmailV1.Schema$MessagePart | undefined,
): gmailV1.Schema$Message => ({ payload });

describe('getBodyData', () => {
  it('should return undefined when payload is missing', () => {
    expect(getBodyData({} as gmailV1.Schema$Message)).toBeUndefined();
  });

  it('should return undefined when no text parts exist', () => {
    const message = makeMessage({
      mimeType: 'multipart/mixed',
      parts: [
        {
          mimeType: 'image/png',
          body: { data: encode('png data'), size: 8 },
          filename: 'image.png',
        },
      ],
    });

    expect(getBodyData(message)).toBeUndefined();
  });

  it('should extract text/plain from parts[0]', () => {
    const text = 'Hello world';
    const message = makeMessage({
      mimeType: 'multipart/alternative',
      parts: [
        {
          mimeType: 'text/plain',
          body: { data: encode(text), size: text.length },
        },
        {
          mimeType: 'text/html',
          body: { data: encode('<p>Hello</p>'), size: 12 },
        },
      ],
    });

    const result = getBodyData(message);

    expect(result).toEqual({ data: encode(text), isHtml: false });
  });

  it('should extract text/plain from parts[1] when parts[0] is not text', () => {
    const text = 'Hello from part 1';
    const message = makeMessage({
      mimeType: 'multipart/mixed',
      parts: [
        {
          mimeType: 'image/png',
          body: { data: encode('png'), size: 3 },
          filename: 'a.png',
        },
        {
          mimeType: 'text/plain',
          body: { data: encode(text), size: text.length },
        },
      ],
    });

    const result = getBodyData(message);

    expect(result).toEqual({ data: encode(text), isHtml: false });
  });

  it('should handle deeply nested MIME (Yandex-style: mixed > related > alternative > text/plain)', () => {
    const text = 'Yandex message body';
    const message = makeMessage({
      mimeType: 'multipart/mixed',
      parts: [
        {
          mimeType: 'multipart/related',
          parts: [
            {
              mimeType: 'multipart/alternative',
              parts: [
                {
                  mimeType: 'text/plain',
                  body: { data: encode(text), size: text.length },
                },
                {
                  mimeType: 'text/html',
                  body: { data: encode('<p>Yandex</p>'), size: 13 },
                },
              ],
            },
          ],
        },
      ],
    });

    const result = getBodyData(message);

    expect(result).toEqual({ data: encode(text), isHtml: false });
  });

  it('should fall back to text/html when no text/plain exists', () => {
    const html = '<p>HTML only message</p>';
    const message = makeMessage({
      mimeType: 'multipart/mixed',
      parts: [
        {
          mimeType: 'text/html',
          body: { data: encode(html), size: html.length },
        },
      ],
    });

    const result = getBodyData(message);

    expect(result).toEqual({ data: encode(html), isHtml: true });
  });

  it('should handle root-level body with no parts array (simple text/plain)', () => {
    const text = 'Simple message';
    const message = makeMessage({
      mimeType: 'text/plain',
      body: { data: encode(text), size: text.length },
    });

    const result = getBodyData(message);

    expect(result).toEqual({ data: encode(text), isHtml: false });
  });

  it('should handle root-level body with text/html', () => {
    const html = '<p>Simple HTML</p>';
    const message = makeMessage({
      mimeType: 'text/html',
      body: { data: encode(html), size: html.length },
    });

    const result = getBodyData(message);

    expect(result).toEqual({ data: encode(html), isHtml: true });
  });

  it('should prefer text/plain over text/html in multipart/alternative', () => {
    const text = 'Plain version';
    const html = '<p>HTML version</p>';
    const message = makeMessage({
      mimeType: 'multipart/alternative',
      parts: [
        {
          mimeType: 'text/html',
          body: { data: encode(html), size: html.length },
        },
        {
          mimeType: 'text/plain',
          body: { data: encode(text), size: text.length },
        },
      ],
    });

    const result = getBodyData(message);

    expect(result).toEqual({ data: encode(text), isHtml: false });
  });

  it('should skip text/plain attachments (has filename + attachmentId)', () => {
    const attachmentText = 'This is an attached text file';
    const bodyText = 'Actual body';
    const message = makeMessage({
      mimeType: 'multipart/mixed',
      parts: [
        {
          mimeType: 'text/plain',
          filename: 'readme.txt',
          body: {
            data: encode(attachmentText),
            size: attachmentText.length,
            attachmentId: 'att-123',
          },
        },
        {
          mimeType: 'text/plain',
          body: { data: encode(bodyText), size: bodyText.length },
        },
      ],
    });

    const result = getBodyData(message);

    expect(result).toEqual({ data: encode(bodyText), isHtml: false });
  });

  it('should handle 4+ levels of nesting', () => {
    const text = 'Deep message';
    const message = makeMessage({
      mimeType: 'multipart/mixed',
      parts: [
        {
          mimeType: 'multipart/mixed',
          parts: [
            {
              mimeType: 'multipart/related',
              parts: [
                {
                  mimeType: 'multipart/alternative',
                  parts: [
                    {
                      mimeType: 'text/plain',
                      body: { data: encode(text), size: text.length },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const result = getBodyData(message);

    expect(result).toEqual({ data: encode(text), isHtml: false });
  });

  it('should stop processing after max parts limit', () => {
    const parts: gmailV1.Schema$MessagePart[] = Array.from(
      { length: 110 },
      () => ({ mimeType: 'multipart/mixed', body: { size: 0 } }),
    );

    parts.push({
      mimeType: 'text/plain',
      body: { data: encode('unreachable'), size: 11 },
    });

    const message = makeMessage({
      mimeType: 'multipart/mixed',
      parts,
    });

    const result = getBodyData(message);

    expect(result).toBeUndefined();
  });

  it('should return last text/plain when multiple exist', () => {
    const first = 'First plain';
    const second = 'Second plain';
    const message = makeMessage({
      mimeType: 'multipart/mixed',
      parts: [
        {
          mimeType: 'text/plain',
          body: { data: encode(first), size: first.length },
        },
        {
          mimeType: 'text/plain',
          body: { data: encode(second), size: second.length },
        },
      ],
    });

    const result = getBodyData(message);

    expect(result).toEqual({ data: encode(second), isHtml: false });
  });
});
