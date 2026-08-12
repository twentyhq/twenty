import { type ImapFlow } from 'imapflow';

import { getImapFolderPath } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/get-imap-folder-path.util';

const legacyClient: Pick<ImapFlow, 'enabled'> = { enabled: new Set<string>() };
const utf8Client: Pick<ImapFlow, 'enabled'> = {
  enabled: new Set(['UTF8=ACCEPT']),
};

describe('getImapFolderPath', () => {
  it('extracts the path from a `path:uidValidity` externalId', () => {
    expect(getImapFolderPath(legacyClient, 'INBOX.Sent:1768984533')).toBe(
      'INBOX.Sent',
    );
  });

  it('returns the externalId unchanged when it has no uidValidity suffix', () => {
    expect(getImapFolderPath(legacyClient, 'INBOX')).toBe('INBOX');
  });

  it('preserves colons inside the path and only strips the trailing uidValidity', () => {
    expect(getImapFolderPath(legacyClient, 'Foo:Bar:42')).toBe('Foo:Bar');
  });

  it('returns the externalId unchanged when the trailing segment is non-numeric', () => {
    expect(getImapFolderPath(legacyClient, 'Project: Updates')).toBe(
      'Project: Updates',
    );
  });

  it('returns null for empty, null, or undefined input', () => {
    expect(getImapFolderPath(legacyClient, '')).toBeNull();
    expect(getImapFolderPath(legacyClient, null)).toBeNull();
    expect(getImapFolderPath(legacyClient, undefined)).toBeNull();
  });

  it('returns the NFC form of a decomposed path on a UTF8=ACCEPT session', () => {
    expect(getImapFolderPath(utf8Client, 'Ane\u0301mo:42')).toBe('An\u00e9mo');
  });

  it('keeps a decomposed path byte-exact when the session has no UTF8=ACCEPT', () => {
    expect(getImapFolderPath(legacyClient, 'Ane\u0301mo:42')).toBe(
      'Ane\u0301mo',
    );
  });
});
