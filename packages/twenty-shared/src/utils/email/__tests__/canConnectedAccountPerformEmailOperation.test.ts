import { ConnectedAccountProvider } from '@/types';
import { canConnectedAccountPerformEmailOperation } from '@/utils/email/canConnectedAccountPerformEmailOperation';

const connectionParameters = { host: 'mail.example.com', port: 993 };

describe('canConnectedAccountPerformEmailOperation', () => {
  describe('IMAP_SMTP_CALDAV, where capability depends on what is configured', () => {
    it('sends but cannot draft when only SMTP is configured', () => {
      const connectedAccount = {
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: { SMTP: connectionParameters },
      };

      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: 'SEND',
        }),
      ).toBe(true);
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: 'DRAFT',
        }),
      ).toBe(false);
    });

    it('drafts but cannot send when only IMAP is configured', () => {
      const connectedAccount = {
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: { IMAP: connectionParameters },
      };

      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: 'SEND',
        }),
      ).toBe(false);
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: 'DRAFT',
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
      };

      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: 'SEND',
        }),
      ).toBe(true);
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: 'DRAFT',
        }),
      ).toBe(true);
    });

    it('does neither when connection parameters are missing entirely', () => {
      const connectedAccount = {
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: null,
      };

      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: 'SEND',
        }),
      ).toBe(false);
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: 'DRAFT',
        }),
      ).toBe(false);
    });

    it('does neither when neither IMAP nor SMTP is configured', () => {
      const connectedAccount = {
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: {},
      };

      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: 'SEND',
        }),
      ).toBe(false);
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: 'DRAFT',
        }),
      ).toBe(false);
    });
  });

  describe('providers whose capability does not depend on configuration', () => {
    it('lets Google send and draft', () => {
      const connectedAccount = {
        provider: ConnectedAccountProvider.GOOGLE,
        connectionParameters: null,
      };

      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: 'SEND',
        }),
      ).toBe(true);
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: 'DRAFT',
        }),
      ).toBe(true);
    });

    it('lets an email group send but never draft', () => {
      const connectedAccount = {
        provider: ConnectedAccountProvider.EMAIL_GROUP,
        connectionParameters: null,
      };

      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: 'SEND',
        }),
      ).toBe(true);
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: 'DRAFT',
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
            },
            operation: 'SEND',
          }),
        ).toBe(false);
      }
    });
  });
});
