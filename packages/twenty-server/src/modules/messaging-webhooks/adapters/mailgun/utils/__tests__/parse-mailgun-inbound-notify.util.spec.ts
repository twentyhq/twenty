import { parseMailgunInboundNotify } from 'src/modules/messaging-webhooks/adapters/mailgun/utils/parse-mailgun-inbound-notify.util';

describe('parseMailgunInboundNotify', () => {
  it('should read fields from a parsed urlencoded body', () => {
    expect(
      parseMailgunInboundNotify(
        {
          timestamp: '1700000000',
          token: 'token-value',
          signature: 'signature-value',
          recipient: 'ch_abc@groups.example.com',
          subject: 'Hello group',
          'message-url':
            'https://storage-us-east4.api.mailgun.net/v3/domains/groups.example.com/messages/key',
        },
        'application/x-www-form-urlencoded',
      ),
    ).toEqual({
      timestamp: '1700000000',
      token: 'token-value',
      signature: 'signature-value',
      recipient: 'ch_abc@groups.example.com',
      subject: 'Hello group',
      messageUrl:
        'https://storage-us-east4.api.mailgun.net/v3/domains/groups.example.com/messages/key',
    });
  });

  it('should read text fields from a raw multipart body', () => {
    const boundary = '------------------------boundary123';
    const part = (name: string, value: string): string =>
      `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
    const body = Buffer.from(
      `${part('timestamp', '1700000000')}${part('token', 'token-value')}${part(
        'signature',
        'signature-value',
      )}${part('recipient', 'ch_abc@groups.example.com')}${part(
        'subject',
        'Hello group',
      )}${part('message-url', 'https://storage.api.mailgun.net/v3/m/key')}--${boundary}--\r\n`,
    );

    expect(
      parseMailgunInboundNotify(
        body,
        `multipart/form-data; boundary=${boundary}`,
      ),
    ).toEqual({
      timestamp: '1700000000',
      token: 'token-value',
      signature: 'signature-value',
      recipient: 'ch_abc@groups.example.com',
      subject: 'Hello group',
      messageUrl: 'https://storage.api.mailgun.net/v3/m/key',
    });
  });

  it('should skip file parts in multipart bodies', () => {
    const boundary = 'b';
    const body = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="attachment-1"; filename="a.png"\r\nContent-Type: image/png\r\n\r\nbinary\r\n--${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\ntoken-value\r\n--${boundary}--\r\n`,
    );

    const fields = parseMailgunInboundNotify(
      body,
      `multipart/form-data; boundary=${boundary}`,
    );

    expect(fields?.token).toBe('token-value');
  });

  it('should return null for a multipart body without a boundary', () => {
    expect(
      parseMailgunInboundNotify(Buffer.from('x'), 'multipart/form-data'),
    ).toBeNull();
  });

  it('should return null for unusable bodies', () => {
    expect(parseMailgunInboundNotify('text', 'text/plain')).toBeNull();
    expect(parseMailgunInboundNotify(null, undefined)).toBeNull();
  });
});
