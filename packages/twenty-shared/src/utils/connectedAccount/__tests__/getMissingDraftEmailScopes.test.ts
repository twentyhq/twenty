import { ConnectedAccountProvider } from '@/types';
import { getMissingDraftEmailScopes } from '@/utils/connectedAccount/getMissingDraftEmailScopes';

const GMAIL_COMPOSE_SCOPE = 'https://www.googleapis.com/auth/gmail.compose';
const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const MICROSOFT_SEND_SCOPE = 'Mail.Send';

describe('getMissingDraftEmailScopes', () => {
  describe('Google provider', () => {
    it.each([
      ['no scopes', []],
      ['only login scopes', ['email', 'profile']],
      ['gmail.send without gmail.compose', [GMAIL_SEND_SCOPE]],
      ['null scopes', null],
    ])('returns the compose scope with %s', (_, scopes) => {
      expect(
        getMissingDraftEmailScopes({
          provider: ConnectedAccountProvider.GOOGLE,
          scopes,
        }),
      ).toEqual([GMAIL_COMPOSE_SCOPE]);
    });

    it('returns nothing when the compose scope is present', () => {
      expect(
        getMissingDraftEmailScopes({
          provider: ConnectedAccountProvider.GOOGLE,
          scopes: ['email', GMAIL_COMPOSE_SCOPE],
        }),
      ).toEqual([]);
    });
  });

  describe('Microsoft provider', () => {
    it.each([
      ['no scopes', []],
      ['only Mail.ReadWrite', ['Mail.ReadWrite']],
      ['null scopes', null],
    ])('returns the send scope with %s', (_, scopes) => {
      expect(
        getMissingDraftEmailScopes({
          provider: ConnectedAccountProvider.MICROSOFT,
          scopes,
        }),
      ).toEqual([MICROSOFT_SEND_SCOPE]);
    });

    it('returns nothing when the send scope is present', () => {
      expect(
        getMissingDraftEmailScopes({
          provider: ConnectedAccountProvider.MICROSOFT,
          scopes: [MICROSOFT_SEND_SCOPE],
        }),
      ).toEqual([]);
    });
  });

  describe('non-OAuth providers', () => {
    it.each([
      ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      ConnectedAccountProvider.EMAIL_GROUP,
      ConnectedAccountProvider.APP,
      ConnectedAccountProvider.OIDC,
      ConnectedAccountProvider.SAML,
    ])('never requires scopes for %s accounts', (provider) => {
      expect(getMissingDraftEmailScopes({ provider, scopes: null })).toEqual(
        [],
      );
    });
  });
});
