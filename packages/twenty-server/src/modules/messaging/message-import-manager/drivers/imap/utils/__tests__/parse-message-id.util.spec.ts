import { parseMessageId } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-message-id.util';

describe('parseMessageId', () => {
  it('parses a valid message id with folder and uid', () => {
    const input = 'INBOX:12345';
    const result = parseMessageId(input);

    expect(result).toEqual({ folder: 'INBOX', uid: 12345 });
  });

  it('parses a folder name with colons', () => {
    const input = 'Sent:Items:6789';
    const result = parseMessageId(input);

    expect(result).toEqual({ folder: 'Sent:Items', uid: 6789 });
  });

  it('returns null for non-numeric uid', () => {
    const input = 'INBOX:abc';
    const result = parseMessageId(input);

    expect(result).toBeNull();
  });

  it('returns null for empty string', () => {
    const input = '';
    const result = parseMessageId(input);

    expect(result).toBeNull();
  });

  it('returns null for missing folder', () => {
    const input = ':123';
    const result = parseMessageId(input);

    expect(result).toBeNull();
  });

  it('returns null for missing uid', () => {
    const input = 'INBOX:';
    const result = parseMessageId(input);

    expect(result).toBeNull();
  });

  it('parses folder with spaces', () => {
    const input = 'My Folder:42';
    const result = parseMessageId(input);

    expect(result).toEqual({ folder: 'My Folder', uid: 42 });
  });
});
