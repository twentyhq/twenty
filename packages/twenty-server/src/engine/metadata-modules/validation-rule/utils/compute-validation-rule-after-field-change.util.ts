import { type ValidationRuleBindings } from 'twenty-shared/types';
import {
  isDefined,
  tokenizeValidationRuleExpression,
} from 'twenty-shared/utils';

export type ValidationRuleFieldChange = {
  fieldUniversalIdentifier: string;
  newFieldName: string | null;
  shouldDisableRulesReadingField: boolean;
  shouldDetachErrorField: boolean;
};

type ValidationRuleFieldChangeTarget = {
  expression: string;
  bindings: ValidationRuleBindings;
  isActive: boolean;
  errorFieldMetadataUniversalIdentifier: string | null;
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

const renameFieldInValidationRule = <
  TValidationRule extends ValidationRuleFieldChangeTarget,
>({
  validationRule,
  fieldUniversalIdentifier,
  newFieldName,
}: {
  validationRule: TValidationRule;
  fieldUniversalIdentifier: string;
  newFieldName: string;
}): TValidationRule => {
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

export const computeValidationRuleAfterFieldChange = <
  TValidationRule extends ValidationRuleFieldChangeTarget,
>({
  validationRule,
  fieldChange,
}: {
  validationRule: TValidationRule;
  fieldChange: ValidationRuleFieldChange;
}): TValidationRule => {
  const {
    fieldUniversalIdentifier,
    newFieldName,
    shouldDisableRulesReadingField,
    shouldDetachErrorField,
  } = fieldChange;

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
    updatedValidationRule.errorFieldMetadataUniversalIdentifier ===
      fieldUniversalIdentifier
  ) {
    updatedValidationRule = {
      ...updatedValidationRule,
      errorFieldMetadataUniversalIdentifier: null,
    };
  }

  return updatedValidationRule;
};
