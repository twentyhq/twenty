import { InvalidStringException } from 'src/engine/metadata-modules/errors/InvalidStringException';
import { validateString } from 'src/engine/metadata-modules/utils/validate-string.utils';

describe('validateString', () => {
  it('does not throw if string is valid', () => {
    const input = 'testName';

    expect(validateString(input)).not.toThrow;
  });

  it('throws error if string has non latin characters', () => {
    const input = 'בְרִבְרִ';

    try {
      validateString(input);
    } catch (error: any) {
      expect(error.name).toBe(InvalidStringException.name);

      return;
    }
    throw new Error('validateString should have thrown');
  });

  it('throws error if starts with digits', () => {
    const input = '123string';

    try {
      validateString(input);
    } catch (error: any) {
      expect(error.name).toBe(InvalidStringException.name);

      return;
    }
    throw new Error('validateString should have thrown');
  });
});
