import { InvalidStringException } from 'src/engine/metadata-modules/errors/InvalidStringException';
import { validateMetadataName } from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';

describe('validateMetadataName', () => {
  it('does not throw if string is valid', () => {
    const input = 'testName';

    expect(validateMetadataName(input)).not.toThrow;
  });

  it('throws error if string has non latin characters', () => {
    const input = 'בְרִבְרִ';

    expect(() => validateMetadataName(input)).toThrow(InvalidStringException);
  });

  it('throws error if starts with digits', () => {
    const input = '123string';

    expect(() => validateMetadataName(input)).toThrow(InvalidStringException);
  });
});
