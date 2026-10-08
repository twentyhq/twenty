import { resolveReceivedAt } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/resolve-received-at.util';

const HEADER_DATE = '2026-08-31T10:00:00.000Z';
const INTERNAL_DATE = new Date('2026-08-31T12:00:00.000Z');
const IMPORT_TIME = new Date('2026-08-31T14:00:00.000Z');

describe('resolveReceivedAt', () => {
  it('uses the Date header when it is valid', () => {
    const result = resolveReceivedAt({
      headerDate: HEADER_DATE,
      internalDate: INTERNAL_DATE,
    });

    expect(result).toEqual(new Date(HEADER_DATE));
  });

  it('falls back to the IMAP internal date when the Date header is missing', () => {
    const result = resolveReceivedAt({ internalDate: INTERNAL_DATE });

    expect(result).toEqual(INTERNAL_DATE);
  });

  it('falls back to the IMAP internal date when the Date header is unparseable', () => {
    const result = resolveReceivedAt({
      headerDate: 'not a date',
      internalDate: INTERNAL_DATE,
    });

    expect(result).toEqual(INTERNAL_DATE);
  });

  it('accepts the internal date as a string', () => {
    const result = resolveReceivedAt({
      internalDate: INTERNAL_DATE.toISOString(),
    });

    expect(result).toEqual(INTERNAL_DATE);
  });

  it('falls back to the import time when neither date is usable', () => {
    jest.useFakeTimers().setSystemTime(IMPORT_TIME);

    const result = resolveReceivedAt({ headerDate: 'not a date' });

    expect(result).toEqual(IMPORT_TIME);

    jest.useRealTimers();
  });
});
