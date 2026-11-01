import { MessageImportDriverExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { type ImapFlowError } from 'src/modules/messaging/message-import-manager/drivers/imap/types/imap-error.type';
import { parseImapAuthenticationError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-authentication-error.util';

const buildImapFlowError = (
  properties: Partial<ImapFlowError>,
): ImapFlowError => Object.assign(new Error('IMAP failure'), properties);

describe('parseImapAuthenticationError', () => {
  it('flags an untrusted server certificate', () => {
    expect(
      parseImapAuthenticationError(
        buildImapFlowError({ code: 'CERT_HAS_EXPIRED' }),
      ).code,
    ).toBe(MessageImportDriverExceptionCode.SERVER_CERTIFICATE_INVALID);
  });

  it('treats network errors as temporary', () => {
    expect(
      parseImapAuthenticationError(buildImapFlowError({ code: 'ECONNRESET' }))
        .code,
    ).toBe(MessageImportDriverExceptionCode.TEMPORARY_ERROR);
  });

  it('flags rejected credentials as insufficient permissions', () => {
    expect(
      parseImapAuthenticationError(
        buildImapFlowError({ authenticationFailed: true }),
      ).code,
    ).toBe(MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS);
  });
});
