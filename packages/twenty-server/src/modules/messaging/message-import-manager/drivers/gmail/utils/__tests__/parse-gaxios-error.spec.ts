import gaxiosErrorMocks from 'src/modules/messaging/message-import-manager/drivers/gmail/mocks/gaxios-error-mocks';
import { isGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-network-error.util';

describe('isGmailNetworkError', () => {
  it('should return a MessageImportDriverException for ECONNRESET', () => {
    const error = gaxiosErrorMocks.getError('ECONNRESET');
    const result = isGmailNetworkError(error);

    expect(result).toBe(true);
  });

  it('should return a MessageImportDriverException for ENOTFOUND', () => {
    const error = gaxiosErrorMocks.getError('ENOTFOUND');
    const result = isGmailNetworkError(error);

    expect(result).toBe(true);
  });

  it('should return a MessageImportDriverException for ECONNABORTED', () => {
    const error = gaxiosErrorMocks.getError('ECONNABORTED');
    const result = isGmailNetworkError(error);

    expect(result).toBe(true);
  });

  it('should return a MessageImportDriverException for ETIMEDOUT', () => {
    const error = gaxiosErrorMocks.getError('ETIMEDOUT');
    const result = isGmailNetworkError(error);

    expect(result).toBe(true);
  });

  it('should return a MessageImportDriverException for ERR_NETWORK', () => {
    const error = gaxiosErrorMocks.getError('ERR_NETWORK');
    const result = isGmailNetworkError(error);

    expect(result).toBe(true);
  });

  it('should return undefined for unknown error codes', () => {
    const error = { code: 'UNKNOWN_ERROR' } as any;
    const result = isGmailNetworkError(error);

    expect(result).toBe(false);
  });
});
