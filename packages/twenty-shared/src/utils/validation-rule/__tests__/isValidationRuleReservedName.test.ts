import { isValidationRuleReservedName } from '@/utils/validation-rule/isValidationRuleReservedName';

describe('isValidationRuleReservedName', () => {
  it('should reserve now, functions, operators and constants', () => {
    expect(
      ['now', 'isDefined', 'includes', 'not', 'and', 'or', 'in', 'true'].every(
        isValidationRuleReservedName,
      ),
    ).toBe(true);
  });

  it('should not reserve an ordinary field name', () => {
    expect(isValidationRuleReservedName('deadline')).toBe(false);
  });
});
