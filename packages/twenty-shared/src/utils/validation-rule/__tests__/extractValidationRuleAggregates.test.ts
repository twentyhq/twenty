import { extractValidationRuleAggregates } from '@/utils/validation-rule/extractValidationRuleAggregates';

describe('extractValidationRuleAggregates', () => {
  it('should return each aggregate once, including inside and/or branches', () => {
    expect(
      extractValidationRuleAggregates(
        'count(people) > 2 or (isDefined(name) and count(people) == 0) or count(opportunities) > 1',
      ),
    ).toEqual([
      { functionName: 'count', relationFieldName: 'people' },
      { functionName: 'count', relationFieldName: 'opportunities' },
    ]);
  });

  it('should return nothing when the expression has no aggregate', () => {
    expect(extractValidationRuleAggregates('isEmpty(name)')).toEqual([]);
  });
});
