import { Temporal } from 'temporal-polyfill';

import { turnPlainDateIntoUserTimeZoneInstantString } from '../turnPlainDateIntoUserTimeZoneInstantString';

describe('turnPlainDateIntoUserTimeZoneInstantString', () => {
  it('should convert a PlainDate to an instant string in UTC', () => {
    const plainDate = Temporal.PlainDate.from('2024-01-01');
    const result = turnPlainDateIntoUserTimeZoneInstantString(plainDate, 'UTC');

    expect(result).toBe('2024-01-01T00:00:00Z');
  });

  it('should convert a PlainDate to an instant string in Asia/Kolkata', () => {
    const plainDate = Temporal.PlainDate.from('2024-01-01');
    const result = turnPlainDateIntoUserTimeZoneInstantString(plainDate, 'Asia/Kolkata');

    expect(result).toBe('2023-12-31T18:30:00Z');
  });

  it('should fallback to UTC when an invalid timezone is provided', () => {
    const plainDate = Temporal.PlainDate.from('2024-01-01');
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    const result = turnPlainDateIntoUserTimeZoneInstantString(plainDate, 'INVALID_TZ');

    expect(result).toBe('2024-01-01T00:00:00Z');
    expect(warnSpy).toBeCalledWith(
      expect.stringContaining('Invalid timezone "INVALID_TZ"'),
    );
    
    warnSpy.mockRestore();
  });
});
