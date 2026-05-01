import { Temporal } from 'temporal-polyfill';
import { turnPlainDateIntoUserTimeZoneInstantString } from '../turnPlainDateIntoUserTimeZoneInstantString';

describe('turnPlainDateIntoUserTimeZoneInstantString', () => {
  const plainDate = Temporal.PlainDate.from('2024-01-01');

  it('should convert plain date to instant string in specified timezone', () => {
    const result = turnPlainDateIntoUserTimeZoneInstantString(plainDate, 'Asia/Kolkata');
    expect(result).toBe('2024-01-01T00:00:00+05:30[Asia/Kolkata]');
  });

  it('should fallback to UTC and warn when invalid timezone is provided', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    const result = turnPlainDateIntoUserTimeZoneInstantString(plainDate, 'INVALID_TZ');
    
    expect(result).toBe('2024-01-01T00:00:00Z[UTC]');
    expect(warnSpy).toBeCalledWith(
      expect.stringContaining('Invalid timezone "INVALID_TZ"'),
    );
    
    warnSpy.mockRestore();
  });
});
