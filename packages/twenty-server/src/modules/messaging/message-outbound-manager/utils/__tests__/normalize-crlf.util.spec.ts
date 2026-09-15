import MailComposer from 'nodemailer/lib/mail-composer';
import { normalizeCrlf } from 'src/modules/messaging/message-outbound-manager/utils/normalize-crlf.util';

describe('normalizeCrlf', () => {
  it('should convert bare LF to CRLF', () => {
    const input = Buffer.from('Line 1\nLine 2\nLine 3', 'utf8');
    const result = normalizeCrlf(input);

    expect(result.toString('utf8')).toBe('Line 1\r\nLine 2\r\nLine 3');
  });

  it('should preserve existing CRLF without duplication', () => {
    const input = Buffer.from('Line 1\r\nLine 2\r\nLine 3', 'utf8');
    const result = normalizeCrlf(input);

    expect(result.toString('utf8')).toBe('Line 1\r\nLine 2\r\nLine 3');
  });

  it('should handle mixed LF and CRLF endings', () => {
    const input = Buffer.from('Line 1\r\nLine 2\nLine 3\r\nLine 4\n', 'utf8');
    const result = normalizeCrlf(input);

    expect(result.toString('utf8')).toBe(
      'Line 1\r\nLine 2\r\nLine 3\r\nLine 4\r\n',
    );
  });

  it('should handle multi-paragraph empty lines', () => {
    const input = Buffer.from('Paragraph 1\n\nParagraph 2', 'utf8');
    const result = normalizeCrlf(input);

    expect(result.toString('utf8')).toBe('Paragraph 1\r\n\r\nParagraph 2');
  });

  it('should leave strings without newlines unchanged', () => {
    const input = Buffer.from('Single line without break', 'utf8');
    const result = normalizeCrlf(input);

    expect(result.toString('utf8')).toBe('Single line without break');
  });

  it('should eliminate bare LF in MailComposer output for multi-paragraph bodies', async () => {
    jest.useRealTimers();
    const composer = new MailComposer({
      from: 'sender@example.com',
      to: 'recipient@example.com',
      subject: 'Test Multi-Paragraph',
      text: 'Paragraph 1\n\nParagraph 2',
      html: '<p>Paragraph 1</p>\n<p>Paragraph 2</p>',
    });

    const rawBuilt = await composer.compile().build();
    const normalized = normalizeCrlf(rawBuilt);

    const rawStr = rawBuilt.toString('utf8');
    const normalizedStr = normalized.toString('utf8');

    // Demonstrates the bug in raw MailComposer output: bare LF exists
    expect(/[^\r]\n/.test(rawStr)).toBe(true);

    // Verifies that normalizeCrlf completely eliminates bare LF per RFC 5322
    expect(/[^\r]\n/.test(normalizedStr)).toBe(false);
  });
});
