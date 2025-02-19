import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import gaxiosErrorMocks from 'src/modules/messaging/message-import-manager/drivers/gmail/mocks/gaxios-error-mocks';
import { parseGaxiosError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gaxios-error.util';

describe('parseGaxiosError', () => {
  it('should return a MessageImportDriverException for ECONNRESET', () => {
    const error = gaxiosErrorMocks.getError('ECONNRESET');
    const result = parseGaxiosError(error);

    expect(result).toBeInstanceOf(MessageImportDriverException);
    expect(result?.message).toBe(error.message);
    expect(result?.code).toBe(MessageImportDriverExceptionCode.TEMPORARY_ERROR);
  });

  it('should return a MessageImportDriverException for ENOTFOUND', () => {
    const error = gaxiosErrorMocks.getError('ENOTFOUND');
    const result = parseGaxiosError(error);

    expect(result).toBeInstanceOf(MessageImportDriverException);
    expect(result?.message).toBe(error.message);
    expect(result?.code).toBe(MessageImportDriverExceptionCode.TEMPORARY_ERROR);
  });

  it('should return a MessageImportDriverException for ECONNABORTED', () => {
    const error = gaxiosErrorMocks.getError('ECONNABORTED');
    const result = parseGaxiosError(error);

    expect(result).toBeInstanceOf(MessageImportDriverException);
    expect(result?.message).toBe(error.message);
    expect(result?.code).toBe(MessageImportDriverExceptionCode.TEMPORARY_ERROR);
  });

  it('should return a MessageImportDriverException for ETIMEDOUT', () => {
    const error = gaxiosErrorMocks.getError('ETIMEDOUT');
    const result = parseGaxiosError(error);

    expect(result).toBeInstanceOf(MessageImportDriverException);
    expect(result?.message).toBe(error.message);
    expect(result?.code).toBe(MessageImportDriverExceptionCode.TEMPORARY_ERROR);
  });

  it('should return a MessageImportDriverException for ERR_NETWORK', () => {
    const error = gaxiosErrorMocks.getError('ERR_NETWORK');
    const result = parseGaxiosError(error);

    expect(result).toBeInstanceOf(MessageImportDriverException);
    expect(result?.message).toBe(error.message);
    expect(result?.code).toBe(MessageImportDriverExceptionCode.TEMPORARY_ERROR);
  });

  it('should return undefined for unknown error codes', () => {
    const error = { code: 'UNKNOWN_ERROR' } as any;
    const result = parseGaxiosError(error);

    expect(result).toBeUndefined();
  });
});
