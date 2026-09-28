import {
  type ObjectValidationRule,
  type ValidationRuleBindings,
} from 'twenty-shared/types';
import {
  isDefined,
  tokenizeValidationRuleExpression,
} from 'twenty-shared/utils';

export type ValidationRuleFieldChange = {
  fieldUniversalIdentifier: string;
  fieldMetadataId: string | null;
  newFieldName: string | null;
  shouldDisableRulesReadingField: boolean;
  shouldDetachErrorField: boolean;
};

const renamePath = ({
  path,
  bindings,
  fieldUniversalIdentifier,
  newFieldName,
}: {
  path: string;
  bindings: ValidationRuleBindings;
  fieldUniversalIdentifier: string;
  newFieldName: string;
}): string => {
  const [rootSegment, memberSegment, ...remainingSegments] = path.split('.');

  if (!isDefined(rootSegment)) {
    return path;
  }

  if (bindings[rootSegment] === fieldUniversalIdentifier) {
    return [newFieldName, memberSegment, ...remainingSegments]
      .filter(isDefined)
      .join('.');
  }

  if (
    isDefined(memberSegment) &&
    bindings[`${rootSegment}.${memberSegment}`] === fieldUniversalIdentifier
  ) {
    return [rootSegment, newFieldName, ...remainingSegments].join('.');
  }

  return path;
};

const renameFieldInValidationRule = ({
  validationRule,
  fieldUniversalIdentifier,
  newFieldName,
}: {
  validationRule: ObjectValidationRule;
  fieldUniversalIdentifier: string;
  newFieldName: string;
}): ObjectValidationRule => {
  const { bindings } = validationRule;

  return {
    ...validationRule,
    expression: tokenizeValidationRuleExpression(validationRule.expression)
      .map((token) =>
        token.type === 'path'
          ? renamePath({
              path: token.text,
              bindings,
              fieldUniversalIdentifier,
              newFieldName,
            })
          : token.text,
      )
      .join(''),
    bindings: Object.fromEntries(
      Object.entries(bindings).map(([path, boundUniversalIdentifier]) => [
        renamePath({ path, bindings, fieldUniversalIdentifier, newFieldName }),
        boundUniversalIdentifier,
      ]),
    ),
  };
};

export const computeValidationRulesAfterFieldChange = ({
  validationRules,
  fieldChange,
}: {
  validationRules: ObjectValidationRule[];
  fieldChange: ValidationRuleFieldChange;
}): { validationRules: ObjectValidationRule[]; hasChanged: boolean } => {
  const {
    fieldUniversalIdentifier,
    fieldMetadataId,
    newFieldName,
    shouldDisableRulesReadingField,
    shouldDetachErrorField,
  } = fieldChange;

  let hasChanged = false;

  const updatedValidationRules = validationRules.map((validationRule) => {
    let updatedValidationRule = validationRule;

    const readsField = Object.values(validationRule.bindings).includes(
      fieldUniversalIdentifier,
    );

    if (readsField && isDefined(newFieldName)) {
      updatedValidationRule = renameFieldInValidationRule({
        validationRule: updatedValidationRule,
        fieldUniversalIdentifier,
        newFieldName,
      });
    }

    if (
      readsField &&
      shouldDisableRulesReadingField &&
      updatedValidationRule.isActive
    ) {
      updatedValidationRule = { ...updatedValidationRule, isActive: false };
    }

    if (
      shouldDetachErrorField &&
      isDefined(fieldMetadataId) &&
      updatedValidationRule.errorFieldMetadataId === fieldMetadataId
    ) {
      updatedValidationRule = {
        ...updatedValidationRule,
        errorFieldMetadataId: null,
      };
    }

    hasChanged ||= updatedValidationRule !== validationRule;

    return updatedValidationRule;
  });

  return { validationRules: updatedValidationRules, hasChanged };
};
