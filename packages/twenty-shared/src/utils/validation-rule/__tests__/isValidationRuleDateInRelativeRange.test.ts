import { isValidationRuleDateInRelativeRange } from '@/utils/validation-rule/isValidationRuleDateInRelativeRange';

describe('isValidationRuleDateInRelativeRange', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-23T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should match the past days before today, without today', () => {
    expect(
      isValidationRuleDateInRelativeRange(
        '2026-09-16T00:00:00.000Z',
        'PAST',
        7,
        'DAY',
      ),
    ).toBe(true);
    expect(
      isValidationRuleDateInRelativeRange(
        '2026-09-15T23:59:59.000Z',
        'PAST',
        7,
        'DAY',
      ),
    ).toBe(false);
    expect(
      isValidationRuleDateInRelativeRange(
        '2026-09-23T08:00:00.000Z',
        'PAST',
        7,
        'DAY',
      ),
    ).toBe(false);
  });

  it('should match the next days after today', () => {
    expect(
      isValidationRuleDateInRelativeRange('2026-09-24', 'NEXT', 2, 'DAY'),
    ).toBe(true);
    expect(
      isValidationRuleDateInRelativeRange('2026-09-26', 'NEXT', 2, 'DAY'),
    ).toBe(false);
  });

  it('should match the current period whatever the amount', () => {
    expect(
      isValidationRuleDateInRelativeRange('2026-09-01', 'THIS', 0, 'MONTH'),
    ).toBe(true);
    expect(
      isValidationRuleDateInRelativeRange('2026-10-01', 'THIS', 1, 'MONTH'),
    ).toBe(false);
  });

  it('should not match a missing date or an unknown period', () => {
    expect(isValidationRuleDateInRelativeRange(null, 'PAST', 7, 'DAY')).toBe(
      false,
    );
    expect(
      isValidationRuleDateInRelativeRange('2026-09-20', 'LAST', 7, 'DAY'),
    ).toBe(false);
    expect(
      isValidationRuleDateInRelativeRange('2026-09-20', 'PAST', 7, 'FORTNIGHT'),
    ).toBe(false);
    expect(
      isValidationRuleDateInRelativeRange('2026-09-20', 'PAST', 0, 'DAY'),
    ).toBe(false);
  });

  it('should not match when the amount is empty', () => {
    expect(
      isValidationRuleDateInRelativeRange('2026-09-20', 'PAST', null, 'DAY'),
    ).toBe(false);
    expect(
      isValidationRuleDateInRelativeRange('2026-09-20', 'NEXT', null, 'DAY'),
    ).toBe(false);
  });
});
