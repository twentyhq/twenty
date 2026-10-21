import { isValidationRuleReservedName } from '@/utils/validation-rule/isValidationRuleReservedName';

const isReservedRoot = (name: string) =>
  isValidationRuleReservedName({ name, isMember: false });

const isReservedMember = (name: string) =>
  isValidationRuleReservedName({ name, isMember: true });

describe('isValidationRuleReservedName', () => {
  it('should reserve now, functions, operators and constants as a root name', () => {
    expect(
      ['now', 'isDefined', 'includes', 'not', 'and', 'or', 'in', 'true'].every(
        isReservedRoot,
      ),
    ).toBe(true);
  });

  it('should reserve only operators and constants after a dot', () => {
    expect(['and', 'abs', 'length', 'true'].every(isReservedMember)).toBe(true);
    expect(['now', 'isDefined'].some(isReservedMember)).toBe(false);
  });

  it('should not reserve an ordinary field name', () => {
    expect(isReservedRoot('deadline')).toBe(false);
    expect(isReservedMember('deadline')).toBe(false);
  });
});
