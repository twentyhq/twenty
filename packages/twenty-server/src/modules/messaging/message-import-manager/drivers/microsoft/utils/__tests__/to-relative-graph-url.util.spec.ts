import { toRelativeGraphUrl } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/to-relative-graph-url.util';

describe('toRelativeGraphUrl', () => {
  it('strips origin and beta version segment from an absolute deltaLink', () => {
    expect(
      toRelativeGraphUrl(
        'https://graph.microsoft.com/beta/me/mailfolders/inbox-id/messages/delta?$deltatoken=abc',
      ),
    ).toBe('/me/mailfolders/inbox-id/messages/delta?$deltatoken=abc');
  });

  it('strips the v1.0 version segment', () => {
    expect(
      toRelativeGraphUrl('https://graph.microsoft.com/v1.0/me/messages'),
    ).toBe('/me/messages');
  });

  it('returns an already-relative url unchanged', () => {
    expect(toRelativeGraphUrl('/me/mailfolders/inbox-id/messages/delta')).toBe(
      '/me/mailfolders/inbox-id/messages/delta',
    );
  });

  it('preserves query parameters on the relative url', () => {
    expect(
      toRelativeGraphUrl(
        'https://graph.microsoft.com/beta/me/messages?$select=id&$top=999',
      ),
    ).toBe('/me/messages?$select=id&$top=999');
  });
});
