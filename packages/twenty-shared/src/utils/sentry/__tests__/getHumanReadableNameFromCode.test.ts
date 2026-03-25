import { getHumanReadableNameFromCode } from '@/utils/sentry/getHumanReadableNameFromCode';

describe('getHumanReadableNameFromCode', () => {
  it('should convert snake_case to Title Case', () => {
    expect(getHumanReadableNameFromCode('hello_world')).toBe('Hello World');
  });

  it('should handle single word', () => {
    expect(getHumanReadableNameFromCode('hello')).toBe('Hello');
  });

  it('should handle uppercase code', () => {
    expect(getHumanReadableNameFromCode('NOT_FOUND')).toBe('Not Found');
  });

  it('should handle multiple underscores', () => {
    expect(getHumanReadableNameFromCode('a_b_c_d')).toBe('A B C D');
  });
});
