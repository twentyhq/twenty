import { Temporal } from 'temporal-polyfill';

import { addUnitToZonedDateTime } from '@/utils/filter/dates/utils/addUnitToZonedDateTime';

describe('addUnitToZonedDateTime', () => {
  const baseZdt = Temporal.ZonedDateTime.from('2024-03-15T12:00:00[UTC]');

  it('should add days', () => {
    const result = addUnitToZonedDateTime(baseZdt, 'DAY', 3);

    expect(result.day).toBe(18);
  });

  it('should add weeks', () => {
    const result = addUnitToZonedDateTime(baseZdt, 'WEEK', 1);

    expect(result.day).toBe(22);
  });

  it('should add months', () => {
    const result = addUnitToZonedDateTime(baseZdt, 'MONTH', 2);

    expect(result.month).toBe(5);
  });

  it('should add quarters', () => {
    const result = addUnitToZonedDateTime(baseZdt, 'QUARTER', 1);

    expect(result.month).toBe(6);
  });

  it('should add years', () => {
    const result = addUnitToZonedDateTime(baseZdt, 'YEAR', 1);

    expect(result.year).toBe(2025);
  });

  it('should add seconds', () => {
    const result = addUnitToZonedDateTime(baseZdt, 'SECOND', 30);

    expect(result.second).toBe(30);
  });

  it('should add minutes', () => {
    const result = addUnitToZonedDateTime(baseZdt, 'MINUTE', 15);

    expect(result.minute).toBe(15);
  });

  it('should add hours', () => {
    const result = addUnitToZonedDateTime(baseZdt, 'HOUR', 3);

    expect(result.hour).toBe(15);
  });
});
