import { ViewFilterOperand } from '@/types';
import { getDashboardFilterConditionValueIssue } from '@/utils/pageLayout/getDashboardFilterConditionValueIssue';

describe('getDashboardFilterConditionValueIssue', () => {
  it.each([
    [ViewFilterOperand.IS, '2026-01-15'],
    [ViewFilterOperand.IS_AFTER, '0001-01-01'],
    [ViewFilterOperand.IS_BEFORE, '9999-12-31'],
    [ViewFilterOperand.IS_RELATIVE, 'PAST_1000_YEAR'],
    [ViewFilterOperand.IS_RELATIVE, 'THIS_1_DAY;;Europe/Paris;;MONDAY;;'],
    [ViewFilterOperand.IS_RELATIVE, 'NEXT_2_WEEK'],
    [ViewFilterOperand.IS_EMPTY, ''],
    [ViewFilterOperand.IS_TODAY, ''],
  ])('should accept %s value "%s"', (operand, value) => {
    expect(
      getDashboardFilterConditionValueIssue({ operand, value }),
    ).toBeUndefined();
  });

  it.each([
    [ViewFilterOperand.IS_AFTER, '2026-01-01T10:00', 'YYYY-MM-DD'],
    [ViewFilterOperand.IS_AFTER, '2026-01-01[u-ca=hebrew]', 'YYYY-MM-DD'],
    [ViewFilterOperand.IS_BEFORE, '+012026-01-01', 'YYYY-MM-DD'],
    [ViewFilterOperand.IS_BEFORE, '0000-01-01', 'YYYY-MM-DD'],
    [ViewFilterOperand.IS, '20260101', 'YYYY-MM-DD'],
    [ViewFilterOperand.IS, '2026-02-30', 'YYYY-MM-DD'],
    [ViewFilterOperand.IS_RELATIVE, 'LAST_MONTH', 'relative date such as'],
    [ViewFilterOperand.IS_RELATIVE, 'PAST_5000_YEAR', 'at most 1000'],
    [ViewFilterOperand.IS_RELATIVE, 'PAST_1000_SECOND', 'a day or longer'],
    [ViewFilterOperand.IS_RELATIVE, 'NEXT_2_MINUTE', 'a day or longer'],
    [ViewFilterOperand.IS_RELATIVE, 'THIS_1_HOUR', 'a day or longer'],
  ])('should reject %s value "%s"', (operand, value, expectedIssue) => {
    expect(getDashboardFilterConditionValueIssue({ operand, value })).toContain(
      expectedIssue,
    );
  });
});
