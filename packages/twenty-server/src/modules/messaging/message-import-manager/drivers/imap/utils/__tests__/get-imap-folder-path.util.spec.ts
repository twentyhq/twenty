import { getImapFolderPath } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/get-imap-folder-path.util';

describe('getImapFolderPath', () => {
  it('extracts the path from a `path:uidValidity` externalId', () => {
    expect(getImapFolderPath('INBOX.Sent:1768984533')).toBe('INBOX.Sent');
  });

  it('returns the externalId unchanged when it has no uidValidity suffix', () => {
    expect(getImapFolderPath('INBOX')).toBe('INBOX');
  });

  it('preserves colons inside the path and only strips the trailing uidValidity', () => {
    expect(getImapFolderPath('Foo:Bar:42')).toBe('Foo:Bar');
  });

  it('returns the externalId unchanged when the trailing segment is non-numeric', () => {
    expect(getImapFolderPath('Project: Updates')).toBe('Project: Updates');
  });

  it('returns null for empty, null, or undefined input', () => {
    expect(getImapFolderPath('')).toBeNull();
    expect(getImapFolderPath(null)).toBeNull();
    expect(getImapFolderPath(undefined)).toBeNull();
  });
});
