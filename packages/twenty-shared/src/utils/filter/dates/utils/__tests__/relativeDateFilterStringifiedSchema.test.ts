import { relativeDateFilterStringifiedSchema } from '@/utils/filter/dates/utils/relativeDateFilterStringifiedSchema';

describe('relativeDateFilterStringifiedSchema', () => {
  it('should parse a valid PAST filter string', () => {
    const result = relativeDateFilterStringifiedSchema.safeParse('PAST_7_DAY');

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.direction).toBe('PAST');
      expect(result.data.amount).toBe(7);
      expect(result.data.unit).toBe('DAY');
    }
  });

  it('should parse a valid NEXT filter string', () => {
    const result =
      relativeDateFilterStringifiedSchema.safeParse('NEXT_30_MINUTE');

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.direction).toBe('NEXT');
      expect(result.data.amount).toBe(30);
      expect(result.data.unit).toBe('MINUTE');
    }
  });

  it('should parse a THIS filter string', () => {
    const result =
      relativeDateFilterStringifiedSchema.safeParse('THIS_1_MONTH');

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.direction).toBe('THIS');
      expect(result.data.unit).toBe('MONTH');
    }
  });

  it('should parse a filter string with timezone', () => {
    const result = relativeDateFilterStringifiedSchema.safeParse(
      'PAST_7_DAY;;America/New_York;;',
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.timezone).toBe('America/New_York');
    }
  });

  it('should parse a filter string with firstDayOfTheWeek', () => {
    const result = relativeDateFilterStringifiedSchema.safeParse(
      'THIS_1_WEEK;;UTC;;MONDAY;;',
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.firstDayOfTheWeek).toBe('MONDAY');
    }
  });

  it('should fail for invalid strings', () => {
    const result =
      relativeDateFilterStringifiedSchema.safeParse('INVALID_STRING');

    expect(result.success).toBe(false);
  });
});
