import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ValidationRuleFieldChange } from 'src/engine/metadata-modules/validation-rule/types/validation-rule-field-change.type';

type ValidationRuleFieldState = {
  universalIdentifier: string;
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

    const isRetyped = existingField.type !== updatedField.type;
    const isDeactivated = existingField.isActive && !updatedField.isActive;

    if (!isRetyped && !isDeactivated) {
      return [];
    }

    return [
      {
        fieldUniversalIdentifier: updatedField.universalIdentifier,
        isDeleted: false,
      },
    ];
  }),
  ...deletedFields.map((deletedField) => ({
    fieldUniversalIdentifier: deletedField.universalIdentifier,
    isDeleted: true,
  })),
];
