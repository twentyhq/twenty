/* @license Enterprise */

import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type OverridableFlatEntity,
  resolveEffectiveFlatEntityProperty,
} from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { type ValidationRuleFieldChange } from 'src/engine/metadata-modules/validation-rule/types/validation-rule-field-change.type';

type ValidationRuleFieldState = OverridableFlatEntity & {
  universalIdentifier: string;
  name: string;
  type: FieldMetadataType;
  isActive: boolean;
};

// A workspace deactivates another application's field through an override
const isFieldActive = (field: ValidationRuleFieldState): boolean =>
  resolveEffectiveFlatEntityProperty({
    metadataName: 'fieldMetadata',
    flatEntity: field,
    property: 'isActive',
  });

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
    const isDeactivated =
      isFieldActive(existingField) && !isFieldActive(updatedField);

    if (!isRenamed && !isRetyped && !isDeactivated) {
      return [];
    }

    return [
      {
        fieldUniversalIdentifier: updatedField.universalIdentifier,
        newFieldName: isRenamed ? updatedField.name : null,
        shouldDisableRulesReadingField: isRetyped || isDeactivated,
        isDeleted: false,
      },
    ];
  }),
  ...deletedFields.map((deletedField) => ({
    fieldUniversalIdentifier: deletedField.universalIdentifier,
    newFieldName: null,
    shouldDisableRulesReadingField: true,
    isDeleted: true,
  })),
];
