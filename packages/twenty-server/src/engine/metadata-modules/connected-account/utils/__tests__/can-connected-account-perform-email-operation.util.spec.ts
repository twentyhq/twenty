import { ConnectedAccountProvider } from 'twenty-shared/types';

import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { type EncryptedConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { canConnectedAccountPerformEmailOperation } from 'src/engine/metadata-modules/connected-account/utils/can-connected-account-perform-email-operation.util';

const connectionParameters: EncryptedConnectionParameters = {
  host: 'mail.example.com',
  port: 993,
  username: 'user',
  password: 'enc:v2:00000000:cGFzc3dvcmQ=' as EncryptedString,
  connectionSecurity: EmailConnectionSecurity.SSL_TLS,
};

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

    it('does neither when only CALDAV is configured', () => {
      const connectedAccount = {
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: { CALDAV: connectionParameters },
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
    it('ignores connection parameters for Google', () => {
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount: {
            provider: ConnectedAccountProvider.GOOGLE,
            connectionParameters: null,
          },
          operation: 'DRAFT',
        }),
      ).toBe(true);
    });

    it('refuses an application connection even with SMTP configured', () => {
      expect(
        canConnectedAccountPerformEmailOperation({
          connectedAccount: {
            provider: ConnectedAccountProvider.APP,
            connectionParameters: { SMTP: connectionParameters },
          },
          operation: 'SEND',
        }),
      ).toBe(false);
    });
  });
});
