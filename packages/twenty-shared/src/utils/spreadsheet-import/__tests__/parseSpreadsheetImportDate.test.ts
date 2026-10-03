import {
  parseSpreadsheetImportDateTime,
  parseSpreadsheetImportPlainDate,
} from '@/utils/spreadsheet-import/parseSpreadsheetImportDate';

describe('parseSpreadsheetImportDateTime', () => {
  it.each([
    ['2023-12-25T10:30:00', 'Europe/Paris', '2023-12-25T09:30:00.000Z'],
    ['2023-12-25 10:30', 'America/New_York', '2023-12-25T15:30:00.000Z'],
    ['12/25/2023 10:30', 'Asia/Tokyo', '2023-12-25T01:30:00.000Z'],
    ['2023-07-01T10:30:00', 'Europe/Paris', '2023-07-01T08:30:00.000Z'],
  ])('reads %s as wall time in %s', (value, timeZone, expectedIsoString) => {
    expect(parseSpreadsheetImportDateTime(value, timeZone).toISOString()).toBe(
      expectedIsoString,
    );
  });

  it.each([
    ['2023-12-25T10:30:00Z', '2023-12-25T10:30:00.000Z'],
    ['2023-12-25T10:30:00+02:00', '2023-12-25T08:30:00.000Z'],
    ['Mon, 25 Dec 2023 10:30:00 GMT', '2023-12-25T10:30:00.000Z'],
    ['Mon, 25 Dec 2023 10:30:00 EST', '2023-12-25T15:30:00.000Z'],
    ['Mon, 25 Dec 2023 10:30:00 UT', '2023-12-25T10:30:00.000Z'],
    ['2023-12-25', '2023-12-25T00:00:00.000Z'],
  ])('keeps the explicit or ISO date-only zone of %s', (value, expected) => {
    expect(
      parseSpreadsheetImportDateTime(value, 'Pacific/Auckland').toISOString(),
    ).toBe(expected);
  });

  it('returns an invalid date for unparsable values', () => {
    expect(
      isNaN(parseSpreadsheetImportDateTime('not a date', 'UTC').getTime()),
    ).toBe(true);
  });
});

describe('parseSpreadsheetImportPlainDate', () => {
  it('keeps the wall date of a local date-time in the requester time zone', () => {
    expect(
      parseSpreadsheetImportPlainDate('12/25/2023 23:30', 'Asia/Tokyo'),
    ).toBe('2023-12-25');
  });

  it('reads ISO dates as written', () => {
    expect(parseSpreadsheetImportPlainDate('2023-12-25', 'Asia/Tokyo')).toBe(
      '2023-12-25',
    );
  });
});
