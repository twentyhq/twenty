import { formatColumnNamesFromCompositeFieldAndSubfields } from 'src/engine/twenty-orm/utils/format-column-names-from-composite-field-and-subfield.util';

describe('formatColumnNamesFromCompositeFieldAndSubfields', () => {
  it('should return fieldName when subFieldName is not defined', () => {
    const result = formatColumnNamesFromCompositeFieldAndSubfields('firstName');

    expect(result).toEqual(['firstName']);
  });

  it('should return concatenated fieldName and capitalized subFieldName when subFieldName is defined', () => {
    const result = formatColumnNamesFromCompositeFieldAndSubfields('user', [
      'firstName',
      'lastName',
    ]);

    expect(result).toEqual(['userFirstName', 'userLastName']);
  });
});
