import { isValidVariable } from '@/utils/validation/isValidVariable';

describe('isValidVariable', () => {
  it('should return true for valid variable syntax', () => {
    expect(isValidVariable('{{step.output}}')).toBe(true);
  });

  it('should return true for nested variable', () => {
    expect(isValidVariable('{{trigger.output.name}}')).toBe(true);
  });

  it('should return false for string without brackets', () => {
    expect(isValidVariable('no brackets')).toBe(false);
  });

  it('should return false for partial brackets', () => {
    expect(isValidVariable('{{incomplete')).toBe(false);
  });

  it('should return false for empty brackets', () => {
    expect(isValidVariable('{{}}')).toBe(false);
  });
});
