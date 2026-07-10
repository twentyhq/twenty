import { formatMessageFromHeader } from 'src/modules/messaging/message-outbound-manager/utils/format-message-from-header.util';

describe('formatMessageFromHeader', () => {
  it('should format name and email when name is provided', () => {
    expect(
      formatMessageFromHeader({
        fromEmail: 'user@example.com',
        fromName: 'Test User',
      }),
    ).toBe('Test User <user@example.com>');
  });

  it('should quote names containing special characters', () => {
    expect(
      formatMessageFromHeader({
        fromEmail: 'user@example.com',
        fromName: 'User, Test',
      }),
    ).toBe('"User, Test" <user@example.com>');
  });

  it('should mime encode names containing non-ascii characters', () => {
    expect(
      formatMessageFromHeader({
        fromEmail: 'user@example.com',
        fromName: 'Jürgen Müller',
      }),
    ).toBe('=?UTF-8?B?SsO8cmdlbiBNw7xsbGVy?= <user@example.com>');
  });

  it('should fall back to the bare email when name is missing', () => {
    expect(
      formatMessageFromHeader({
        fromEmail: 'user@example.com',
        fromName: null,
      }),
    ).toBe('user@example.com');
  });

  it('should fall back to the bare email when name is blank', () => {
    expect(
      formatMessageFromHeader({
        fromEmail: 'user@example.com',
        fromName: '',
      }),
    ).toBe('user@example.com');
  });
});
