import { normalizeMessageText } from 'src/modules/messaging/message-import-manager/utils/normalize-message-text.util';

describe('normalizeMessageText', () => {
  it('should convert CRLF and bare CR to LF', () => {
    expect(normalizeMessageText('line one\r\nline two\rline three')).toBe(
      'line one\nline two\nline three',
    );
  });

  it('should replace non-breaking spaces with regular spaces', () => {
    expect(normalizeMessageText('Hello\u00A0world')).toBe('Hello world');
  });

  it('should strip trailing whitespace on each line', () => {
    expect(normalizeMessageText('hello   \nworld\t')).toBe('hello\nworld');
  });

  it('should collapse runs of three or more blank lines to one blank line', () => {
    expect(normalizeMessageText('top\n\n\n\n\nbottom')).toBe('top\n\nbottom');
  });

  it('should trim leading and trailing whitespace overall', () => {
    expect(normalizeMessageText('\r\n\r\n\r\nHello\r\n\r\n')).toBe('Hello');
  });

  it('should leave already-clean text unchanged', () => {
    expect(normalizeMessageText('Hello\n\nworld')).toBe('Hello\n\nworld');
  });
});
