import { FieldMetadataType } from 'twenty-shared/types';

import { isFlatFieldMetadataEligibleForRecordForm } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/is-flat-field-metadata-eligible-for-record-form.util';

const NUMBER_FLAT_FIELD_METADATA = {
  universalIdentifier: 'field-total',
  name: 'total',
  type: FieldMetadataType.NUMBER,
  isActive: true,
  isSystem: false,
  isUIEditable: true,
  isSystemSideEffect: false,
  universalSettings: { decimals: 2 },
  applicationUniversalIdentifier: 'application',
  overrides: null,
};

describe('isFlatFieldMetadataEligibleForRecordForm', () => {
  it('should offer a stored field in the record form', () => {
    expect(
      isFlatFieldMetadataEligibleForRecordForm(NUMBER_FLAT_FIELD_METADATA),
    ).toBe(true);
  });

  it('should not offer a formula field in the record form', () => {
    expect(
      isFlatFieldMetadataEligibleForRecordForm({
        ...NUMBER_FLAT_FIELD_METADATA,
        universalSettings: {
          decimals: 2,
          formula: { expression: 'price * quantity' },
        },
      }),
    ).toBe(false);
  });
});
