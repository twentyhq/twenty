import { type GaxiosError } from 'gaxios';

import { CalendarEventImportDriverExceptionCode } from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { parseGaxiosError } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/parse-gaxios-error.util';

const gaxiosErrorWithCode = (code: string) =>
  ({ code, message: `socket failure: ${code}` }) as GaxiosError;

describe('parseGaxiosError', () => {
  it.each([
    'ECONNRESET',
    'ENOTFOUND',
    'ECONNABORTED',
    'ETIMEDOUT',
    'ERR_NETWORK',
  ])('maps the %s socket failure to a temporary error', (code) => {
    const exception = parseGaxiosError(gaxiosErrorWithCode(code));

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(exception.message).toBe(`socket failure: ${code}`);
  });

  // EHOSTUNREACH and ECONNREFUSED are declared on MessageNetworkExceptionCode
  // but are not matched here, so they fall through to the unknown branch.
  it.each(['EHOSTUNREACH', 'ECONNREFUSED', 'EPIPE'])(
    'maps the unmatched %s socket failure to an unknown network error',
    (code) => {
      const exception = parseGaxiosError(gaxiosErrorWithCode(code));

      expect(exception.code).toBe(
        CalendarEventImportDriverExceptionCode.UNKNOWN_NETWORK_ERROR,
      );
    },
  );

  it('maps an error without a code to an unknown network error', () => {
    const exception = parseGaxiosError({
      message: 'no code at all',
    } as GaxiosError);

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.UNKNOWN_NETWORK_ERROR,
    );
  });
});
