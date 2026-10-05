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
  it('should list every change of the migration, updates and deletions alike', () => {
    expect(
      computeValidationRuleFieldChanges({
        updatedFields: [
          { ...AMOUNT, name: 'dealValue' },
          { ...STAGE, isActive: false },
        ],
        deletedFields: [{ universalIdentifier: 'score-universal-identifier' }],
        existingFieldByUniversalIdentifier:
          EXISTING_FIELD_BY_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual([
      {
        fieldUniversalIdentifier: AMOUNT.universalIdentifier,
        newFieldName: 'dealValue',
        shouldDisableRulesReadingField: false,
        isDeleted: false,
      },
      {
        fieldUniversalIdentifier: STAGE.universalIdentifier,
        newFieldName: null,
        shouldDisableRulesReadingField: true,
        isDeleted: false,
      },
      {
        fieldUniversalIdentifier: 'score-universal-identifier',
        newFieldName: null,
        shouldDisableRulesReadingField: true,
        isDeleted: true,
      },
    ]);
  });

  it('should disable rules on a type change without detaching the error field', () => {
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
        newFieldName: null,
        shouldDisableRulesReadingField: true,
        isDeleted: false,
      },
    ]);
  });

  it('should ignore updates that leave the name, type and activation alone, and fields that did not exist', () => {
    expect(
      computeValidationRuleFieldChanges({
        updatedFields: [
          { ...AMOUNT },
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
