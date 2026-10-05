import { FieldMetadataType } from 'twenty-shared/types';

import { computeValidationRuleFieldChanges } from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-field-changes.util';

const AMOUNT = {
  universalIdentifier: 'amount-universal-identifier',
  name: 'amount',
  type: FieldMetadataType.CURRENCY,
  isActive: true,
};

const STAGE = {
  universalIdentifier: 'stage-universal-identifier',
  name: 'stage',
  type: FieldMetadataType.SELECT,
  isActive: true,
};

const EXISTING_FIELD_BY_UNIVERSAL_IDENTIFIER = {
  [AMOUNT.universalIdentifier]: AMOUNT,
  [STAGE.universalIdentifier]: STAGE,
};

describe('computeValidationRuleFieldChanges', () => {
  it('should list every deactivation and deletion of the migration', () => {
    expect(
      computeValidationRuleFieldChanges({
        updatedFields: [{ ...STAGE, isActive: false }],
        deletedFields: [{ universalIdentifier: 'score-universal-identifier' }],
        existingFieldByUniversalIdentifier:
          EXISTING_FIELD_BY_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual([
      {
        fieldUniversalIdentifier: STAGE.universalIdentifier,
        isDeleted: false,
      },
      {
        fieldUniversalIdentifier: 'score-universal-identifier',
        isDeleted: true,
      },
    ]);
  });

  it('should list a type change', () => {
    expect(
      computeValidationRuleFieldChanges({
        updatedFields: [{ ...STAGE, type: FieldMetadataType.MULTI_SELECT }],
        deletedFields: [],
        existingFieldByUniversalIdentifier:
          EXISTING_FIELD_BY_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual([
      {
        fieldUniversalIdentifier: STAGE.universalIdentifier,
        isDeleted: false,
      },
    ]);
  });

  it('should ignore renames, updates that leave the type and activation alone, and fields that did not exist', () => {
    expect(
      computeValidationRuleFieldChanges({
        updatedFields: [
          { ...AMOUNT, name: 'dealValue' },
          { ...STAGE, isActive: true },
          {
            universalIdentifier: 'new-universal-identifier',
            name: 'newField',
            type: FieldMetadataType.TEXT,
            isActive: true,
          },
        ],
        deletedFields: [],
        existingFieldByUniversalIdentifier:
          EXISTING_FIELD_BY_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual([]);
  });
});
