import { formatMessageFromHeader } from 'src/modules/messaging/message-outbound-manager/utils/format-message-from-header.util';

describe('formatMessageFromHeader', () => {
  it('should format name and email when name is provided', () => {
    expect(
      formatMessageFromHeader({
        fromEmail: 'user@example.com',
        fromName: 'Test User',
      }),
    ).toBe('=?UTF-8?B?VGVzdCBVc2Vy?= <user@example.com>');
  });

  it('should trim the name before formatting the header', () => {
    expect(
      formatMessageFromHeader({
        fromEmail: 'user@example.com',
        fromName: '  Test User  ',
      }),
    ).toBe('=?UTF-8?B?VGVzdCBVc2Vy?= <user@example.com>');
  });

  it('should fall back to the bare email when name is missing', () => {
    expect(
      formatMessageFromHeader({
        fromEmail: 'user@example.com',
        fromName: null,
      }),
    ).toBe('user@example.com');
  });
});
