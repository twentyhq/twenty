import { isImapMailboxNotFoundError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/is-imap-mailbox-not-found-error.util';

describe('isImapMailboxNotFoundError', () => {
  it.each([
    { serverResponseCode: 'NONEXISTENT' },
    { mailboxMissing: true },
    {
      responseText: "Mailbox doesn't exist: Ghost (0.001 + 0.000 secs).",
    },
    { responseText: 'Unknown Mailbox: Ghost' },
    { responseText: 'Mailbox does not exist' },
  ])('recognizes an unavailable mailbox: %o', (details) => {
    const error = Object.assign(new Error('Command failed'), {
      responseStatus: 'NO',
      ...details,
    });

    expect(isImapMailboxNotFoundError(error)).toBe(true);
  });

  it.each([
    { responseStatus: 'NO', responseText: 'Access denied' },
    { responseStatus: 'BAD', serverResponseCode: 'NONEXISTENT' },
    { responseStatus: 'NO', serverResponseCode: 'NOPERM' },
  ])('does not classify non-mailbox failures as unavailable: %o', (details) => {
    const error = Object.assign(new Error('Command failed'), details);

    expect(isImapMailboxNotFoundError(error)).toBe(false);
  });
});
