import { validateFlatObjectMetadataIdentifiers } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-identifiers.util';
import { FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK } from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';

const validateLabelIdentifier = (labelIdentifierUniversalIdentifier: string) =>
  validateFlatObjectMetadataIdentifiers({
    universalFlatObjectMetadata: {
      labelIdentifierFieldMetadataUniversalIdentifier:
        labelIdentifierUniversalIdentifier,
      imageIdentifierFieldMetadataUniversalIdentifier: null,
    },
    universalFlatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  }).map(({ message }) => message);

describe('validateFlatObjectMetadataIdentifiers', () => {
  it('should accept a stored text field as label identifier', () => {
    expect(validateLabelIdentifier('supplier-name-uid')).toEqual([]);
  });

  it('should refuse a formula field as label identifier', () => {
    expect(validateLabelIdentifier('supplier-shout-uid')).toEqual([
      'labelIdentifierFieldMetadataUniversalIdentifier validation failed: field is a formula',
    ]);
  });
});
