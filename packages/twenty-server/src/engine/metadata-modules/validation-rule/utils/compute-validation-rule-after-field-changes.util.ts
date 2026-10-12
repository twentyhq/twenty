import { type ValidationRuleBindings } from 'twenty-shared/types';
import {
  isDefined,
  isValidationRuleReservedName,
  tokenizeValidationRuleExpression,
} from 'twenty-shared/utils';

import { type ValidationRuleFieldChange } from 'src/engine/metadata-modules/validation-rule/types/validation-rule-field-change.type';

type ValidationRuleFieldChangeTarget = {
  expression: string;
  bindings: ValidationRuleBindings;
  isActive: boolean;
  errorFieldMetadataUniversalIdentifier: string | null;
};

const renamePath = ({
  path,
  bindings,
  newFieldNameByUniversalIdentifier,
}: {
  path: string;
  bindings: ValidationRuleBindings;
  newFieldNameByUniversalIdentifier: Map<string, string>;
}): string => {
  const [rootSegment, memberSegment, ...remainingSegments] = path.split('.');

  if (!isDefined(rootSegment)) {
    return path;
  }

  const rootUniversalIdentifier = bindings[rootSegment];
  const memberUniversalIdentifier = isDefined(memberSegment)
    ? bindings[`${rootSegment}.${memberSegment}`]
    : undefined;

  return [
    (isDefined(rootUniversalIdentifier)
      ? newFieldNameByUniversalIdentifier.get(rootUniversalIdentifier)
      : undefined) ?? rootSegment,
    isDefined(memberUniversalIdentifier)
      ? (newFieldNameByUniversalIdentifier.get(memberUniversalIdentifier) ??
        memberSegment)
      : memberSegment,
    ...remainingSegments,
  ]
    .filter(isDefined)
    .join('.');
};

const renameFieldsInValidationRule = <
  TValidationRule extends ValidationRuleFieldChangeTarget,
>({
  validationRule,
  newFieldNameByUniversalIdentifier,
}: {
  validationRule: TValidationRule;
  newFieldNameByUniversalIdentifier: Map<string, string>;
}): TValidationRule | null => {
  const { bindings } = validationRule;
  const renamedBindings: ValidationRuleBindings = {};

  for (const [path, boundUniversalIdentifier] of Object.entries(bindings)) {
    const newFieldName = newFieldNameByUniversalIdentifier.get(
      boundUniversalIdentifier,
    );

    if (
      isDefined(newFieldName) &&
      isValidationRuleReservedName({
        name: newFieldName,
        isMember: path.includes('.'),
      })
    ) {
      return null;
    }

    const renamedPath = renamePath({
      path,
      bindings,
      newFieldNameByUniversalIdentifier,
    });

    if (
      isDefined(renamedBindings[renamedPath]) &&
      renamedBindings[renamedPath] !== boundUniversalIdentifier
    ) {
      return null;
    }

    renamedBindings[renamedPath] = boundUniversalIdentifier;
  }

  return {
    ...validationRule,
    expression: tokenizeValidationRuleExpression(validationRule.expression)
      .map((token) =>
        token.type === 'path'
          ? renamePath({
              path: token.text,
              bindings,
              newFieldNameByUniversalIdentifier,
            })
          : token.text,
      )
      .join(''),
    bindings: renamedBindings,
  };
};

export const computeValidationRuleAfterFieldChanges = <
  TValidationRule extends ValidationRuleFieldChangeTarget,
>({
  validationRule,
  fieldChanges,
}: {
  validationRule: TValidationRule;
  fieldChanges: ValidationRuleFieldChange[];
}): TValidationRule => {
  const readFieldUniversalIdentifiers = new Set(
    Object.values(validationRule.bindings),
  );
  const readFieldChanges = fieldChanges.filter(({ fieldUniversalIdentifier }) =>
    readFieldUniversalIdentifiers.has(fieldUniversalIdentifier),
  );

  const newFieldNameByUniversalIdentifier = new Map(
    readFieldChanges.flatMap(({ fieldUniversalIdentifier, newFieldName }) =>
      isDefined(newFieldName)
        ? [[fieldUniversalIdentifier, newFieldName] as const]
        : [],
    ),
  );

  const renamedValidationRule =
    newFieldNameByUniversalIdentifier.size > 0
      ? renameFieldsInValidationRule({
          validationRule,
          newFieldNameByUniversalIdentifier,
        })
      : validationRule;

  const shouldDisable =
    !isDefined(renamedValidationRule) ||
    readFieldChanges.some(
      ({ shouldDisableRulesReadingField }) => shouldDisableRulesReadingField,
    );
  const shouldDetachErrorField = fieldChanges.some(
    (fieldChange) =>
      fieldChange.isDeleted &&
      validationRule.errorFieldMetadataUniversalIdentifier ===
        fieldChange.fieldUniversalIdentifier,
  );

  let updatedValidationRule = renamedValidationRule ?? validationRule;

  if (shouldDisable && updatedValidationRule.isActive) {
    updatedValidationRule = { ...updatedValidationRule, isActive: false };
  }

  if (shouldDetachErrorField) {
    updatedValidationRule = {
      ...updatedValidationRule,
      errorFieldMetadataUniversalIdentifier: null,
    };
  }

  return updatedValidationRule;
};
