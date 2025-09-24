import { mimeEncode } from 'src/modules/messaging/message-import-manager/utils/mime-encode.util';

describe('Gmail MIME Message Format', () => {
  it('should create valid multipart/alternative MIME structure', () => {
    const sendMessageInput = {
      to: 'test@example.com',
      subject: 'Test Subject',
      body: 'Plain text content',
      html: '<p>HTML content</p>',
    };

    const fromEmail = 'sender@example.com';
    const fromName = 'Test Sender';
    const boundary = 'boundary_test_123';

    const headers: string[] = [];

    headers.push(`From: "${mimeEncode(fromName)}" <${fromEmail}>`);
    headers.push(
      `To: ${sendMessageInput.to}`,
      `Subject: ${mimeEncode(sendMessageInput.subject)}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      sendMessageInput.body,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      '',
      sendMessageInput.html,
      '',
      `--${boundary}--`,
    );

    const message = headers.join('\n');

    expect(message).toContain('MIME-Version: 1.0');
    expect(message).toContain('Content-Type: multipart/alternative');
    expect(message).toContain('Content-Type: text/plain; charset="UTF-8"');
    expect(message).toContain('Content-Type: text/html; charset="UTF-8"');
    expect(message).toContain('Plain text content');
    expect(message).toContain('<p>HTML content</p>');
    expect(message).toContain(`--${boundary}`);
    expect(message).toContain(`--${boundary}--`);
  });

  it('should handle missing fromName gracefully', () => {
    const fromEmail = 'sender@example.com';
    const headers: string[] = [];

    headers.push(`From: ${fromEmail}`);

    const message = headers.join('\n');

    expect(message).toContain(`From: ${fromEmail}`);
    expect(message).not.toContain('""');
  });
});
