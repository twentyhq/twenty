import { ImapSmtpMessageOutboundService } from './imap-smtp-message-outbound.service';

describe('ImapSmtpMessageOutboundService - compileRawMessage line endings', () => {
  let service: ImapSmtpMessageOutboundService;

  beforeEach(() => {
    service = Object.create(
      ImapSmtpMessageOutboundService.prototype,
    ) as ImapSmtpMessageOutboundService;
  });

  const compile = (sendMessageInput: any) =>
    (service as any).compileRawMessage('sender@example.com', sendMessageInput);

  it('produces CRLF line endings for a single-paragraph plain text body', async () => {
    const buffer: Buffer = await compile({
      to: ['recipient@example.com'],
      subject: 'Single paragraph',
      text: 'Hello world',
    });

    expect(/[^\r]\n/.test(buffer.toString('utf8'))).toBe(false);
  });

  it('produces CRLF line endings for a multi-paragraph plain text body', async () => {
    const buffer: Buffer = await compile({
      to: ['recipient@example.com'],
      subject: 'Multi paragraph',
      text: 'Paragraph A\n\nParagraph B',
    });

    const raw = buffer.toString('utf8');

    expect(/[^\r]\n/.test(raw)).toBe(false);
    expect(raw).toContain('Paragraph A\r\n\r\nParagraph B');
  });

  it('produces CRLF line endings for a multi-paragraph HTML body', async () => {
    const buffer: Buffer = await compile({
      to: ['recipient@example.com'],
      subject: 'Multi paragraph HTML',
      html: '<p>Paragraph A</p>\n<p>Paragraph B</p>',
    });

    expect(/[^\r]\n/.test(buffer.toString('utf8'))).toBe(false);
  });
});
