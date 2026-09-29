import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ValidationRuleFieldChange } from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-after-field-change.util';

type ValidationRuleFieldState = {
  universalIdentifier: string;
  name: string;
  type: FieldMetadataType;
  isActive: boolean;
};

export const computeValidationRuleFieldChanges = ({
  updatedFields,
  deletedFields,
  existingFieldByUniversalIdentifier,
}: {
  updatedFields: ValidationRuleFieldState[];
  deletedFields: Pick<ValidationRuleFieldState, 'universalIdentifier'>[];
  existingFieldByUniversalIdentifier: Partial<
    Record<string, ValidationRuleFieldState>
  >;
}): ValidationRuleFieldChange[] => [
  ...updatedFields.flatMap((updatedField) => {
    const existingField =
      existingFieldByUniversalIdentifier[updatedField.universalIdentifier];

    if (!isDefined(existingField)) {
      return [];
    }

    const isRenamed = existingField.name !== updatedField.name;
    const isRetyped = existingField.type !== updatedField.type;
    const isDeactivated = existingField.isActive && !updatedField.isActive;

    if (!isRenamed && !isRetyped && !isDeactivated) {
      return [];
    }

    return [
      {
        fieldUniversalIdentifier: updatedField.universalIdentifier,
        newFieldName: isRenamed ? updatedField.name : null,
        shouldDisableRulesReadingField: isRetyped || isDeactivated,
        shouldDetachErrorField: isDeactivated,
      },
    ];
  }),
  ...deletedFields.map((deletedField) => ({
    fieldUniversalIdentifier: deletedField.universalIdentifier,
    newFieldName: null,
    shouldDisableRulesReadingField: true,
    shouldDetachErrorField: true,
  })),
];
