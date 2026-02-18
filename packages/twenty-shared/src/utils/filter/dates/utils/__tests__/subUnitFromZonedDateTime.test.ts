import { Temporal } from 'temporal-polyfill';

import { subUnitFromZonedDateTime } from '@/utils/filter/dates/utils/subUnitFromZonedDateTime';

describe('subUnitFromZonedDateTime', () => {
  const baseZdt = Temporal.ZonedDateTime.from('2024-03-15T12:00:00[UTC]');

  it('should subtract days', () => {
    const result = subUnitFromZonedDateTime(baseZdt, 'DAY', 3);

    expect(result.day).toBe(12);
  });

  it('should subtract weeks', () => {
    const result = subUnitFromZonedDateTime(baseZdt, 'WEEK', 1);

    expect(result.day).toBe(8);
  });

  it('should subtract months', () => {
    const result = subUnitFromZonedDateTime(baseZdt, 'MONTH', 2);

    expect(result.month).toBe(1);
  });

  it('should subtract quarters', () => {
    const result = subUnitFromZonedDateTime(baseZdt, 'QUARTER', 1);

    expect(result.month).toBe(12);
    expect(result.year).toBe(2023);
  });

  it('should subtract years', () => {
    const result = subUnitFromZonedDateTime(baseZdt, 'YEAR', 1);

    expect(result.year).toBe(2023);
  });

  it('should subtract seconds', () => {
    const result = subUnitFromZonedDateTime(baseZdt, 'SECOND', 30);

    expect(result.second).toBe(30);
    expect(result.minute).toBe(59);
    expect(result.hour).toBe(11);
  });

  it('should subtract minutes', () => {
    const result = subUnitFromZonedDateTime(baseZdt, 'MINUTE', 15);

    expect(result.minute).toBe(45);
  });

  it('should subtract hours', () => {
    const result = subUnitFromZonedDateTime(baseZdt, 'HOUR', 3);

    expect(result.hour).toBe(9);
  });
});
