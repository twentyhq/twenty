import { ConnectedAccountProvider, EmailOperation } from '@/types';
import { canConnectedAccountPerformEmailOperation } from '@/utils/email/canConnectedAccountPerformEmailOperation';

const connectionParameters = { host: 'mail.example.com', port: 993 };

describe('canConnectedAccountPerformEmailOperation', () => {
  describe('IMAP_SMTP_CALDAV, where capability depends on what is configured', () => {
    it('sends but cannot draft when only SMTP is configured', () => {
      const connectedAccount = {
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: { SMTP: connectionParameters },
        scopes: null,
      };

      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.SEND,
        }),
      ).toBe(true);
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.DRAFT,
        }),
      ).toBe(false);
    });

    it('drafts but cannot send when only IMAP is configured', () => {
      const connectedAccount = {
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: { IMAP: connectionParameters },
        scopes: null,
      };

      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.SEND,
        }),
      ).toBe(false);
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.DRAFT,
        }),
      ).toBe(true);
    });

    it('does both when IMAP and SMTP are configured', () => {
      const connectedAccount = {
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: {
          IMAP: connectionParameters,
          SMTP: connectionParameters,
        },
        scopes: null,
      };

      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.SEND,
        }),
      ).toBe(true);
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.DRAFT,
        }),
      ).toBe(true);
    });

    it('does neither when connection parameters are missing entirely', () => {
      const connectedAccount = {
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: null,
        scopes: null,
      };

      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.SEND,
        }),
      ).toBe(false);
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.DRAFT,
        }),
      ).toBe(false);
    });

    it('does neither when neither IMAP nor SMTP is configured', () => {
      const connectedAccount = {
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: {},
        scopes: null,
      };

      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.SEND,
        }),
      ).toBe(false);
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.DRAFT,
        }),
      ).toBe(false);
    });
  });

  describe('Google and Microsoft, where capability depends on the granted scopes', () => {
    it.each([
      [
        ConnectedAccountProvider.GOOGLE,
        ['email', 'https://www.googleapis.com/auth/gmail.send'],
      ],
      [ConnectedAccountProvider.MICROSOFT, ['User.Read', 'Mail.Send']],
      [ConnectedAccountProvider.GOOGLE, null],
      [ConnectedAccountProvider.MICROSOFT, null],
    ])('lets %s send and draft with the scopes %j', (provider, scopes) => {
      const connectedAccount = { provider, scopes };

      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.SEND,
        }),
      ).toBe(true);
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.DRAFT,
        }),
      ).toBe(true);
    });

    it.each([
      [ConnectedAccountProvider.GOOGLE, ['email', 'profile']],
      [ConnectedAccountProvider.MICROSOFT, ['User.Read']],
    ])('refuses a %s account stored by an SSO sign-in', (provider, scopes) => {
      const connectedAccount = { provider, scopes };

      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.SEND,
        }),
      ).toBe(false);
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.DRAFT,
        }),
      ).toBe(false);
    });
  });

  describe('providers whose capability does not depend on configuration', () => {
    it('lets an email group send but never draft', () => {
      const connectedAccount = {
        provider: ConnectedAccountProvider.EMAIL_GROUP,
        connectionParameters: null,
        scopes: null,
      };

      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.SEND,
        }),
      ).toBe(true);
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.DRAFT,
        }),
      ).toBe(false);
    });

    it('refuses a provider absent from both allowlists even with SMTP configured', () => {
      for (const provider of [
        ConnectedAccountProvider.OIDC,
        ConnectedAccountProvider.SAML,
        ConnectedAccountProvider.APP,
      ]) {
        expect(
          canConnectedAccountPerformEmailOperation({
            connectedAccount: {
              provider,
              connectionParameters: { SMTP: connectionParameters },
              scopes: null,
            },
            operation: EmailOperation.SEND,
          }),
        ).toBe(false);
      }
    });
  });
});
