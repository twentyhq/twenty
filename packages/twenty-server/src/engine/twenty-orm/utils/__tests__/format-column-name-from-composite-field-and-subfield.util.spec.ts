import { formatColumnNameFromCompositeFieldAndSubfield } from 'src/engine/twenty-orm/utils/format-column-name-from-composite-field-and-subfield.util';

describe('formatColumnNameFromCompositeFieldAndSubfield', () => {
  it('should return fieldName when subFieldName is not defined', () => {
    const result = formatColumnNameFromCompositeFieldAndSubfield('firstName');

    expect(result).toBe('firstName');
  });

  it('should return concatenated fieldName and capitalized subFieldName when subFieldName is defined', () => {
    const result = formatColumnNameFromCompositeFieldAndSubfield(
      'user',
      'firstName',
    );

    expect(result).toBe('userFirstName');
  });
});
