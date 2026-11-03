import { msg, t } from '@lingui/core/macro';
import { CONDITIONAL_DISPLAY_CONTEXT_KEYS } from 'twenty-shared/constants';
import { type ConditionalDisplayContextKey } from 'twenty-shared/types';
import {
  getConditionalDisplayContextVirtualField,
  isDefined,
} from 'twenty-shared/utils';

import { CONDITIONAL_DISPLAY_SUB_FIELD_NAME_IDENTIFIER_PATTERN } from 'src/engine/metadata-modules/flat-conditional-display/constants/conditional-display-sub-field-name-identifier-pattern.constant';
import { CONDITIONAL_DISPLAY_SUB_FIELD_NAME_PATH_PATTERN } from 'src/engine/metadata-modules/flat-conditional-display/constants/conditional-display-sub-field-name-path-pattern.constant';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateConditionalDisplayContextLeafSubFieldName = ({
  subFieldName,
  contextKey,
  invalidDataCode,
}: {
  subFieldName: string | null | undefined;
  contextKey: ConditionalDisplayContextKey;
  invalidDataCode: string;
}): FlatEntityValidationError[] => {
  const { subject } = CONDITIONAL_DISPLAY_CONTEXT_KEYS[contextKey];

  if (subject.kind === 'value') {
    if (!isDefined(subFieldName)) {
      return [];
    }

    return [
      {
        code: invalidDataCode,
        message: t`Conditional display context key "${contextKey}" does not accept a sub field name`,
        userFriendlyMessage: msg`Conditional display rule sub field is not supported`,
        value: subFieldName,
      },
    ];
  }

  if (!isDefined(subFieldName)) {
    return [
      {
        code: invalidDataCode,
        message: t`Conditional display context key "${contextKey}" requires a sub field name`,
        userFriendlyMessage: msg`Conditional display rule is missing a sub field`,
        value: contextKey,
      },
    ];
  }

  switch (subject.kind) {
    case 'mapEntry': {
      if (
        CONDITIONAL_DISPLAY_SUB_FIELD_NAME_IDENTIFIER_PATTERN.test(subFieldName)
      ) {
        return [];
      }

      return [
        {
          code: invalidDataCode,
          message: t`Sub field name "${subFieldName}" of conditional display context key "${contextKey}" must be an identifier`,
          userFriendlyMessage: msg`Conditional display rule sub field is not valid`,
          value: subFieldName,
        },
      ];
    }
    case 'property': {
      if (
        isDefined(
          getConditionalDisplayContextVirtualField({
            contextKey,
            subFieldName,
          }),
        )
      ) {
        return [];
      }

      return [
        {
          code: invalidDataCode,
          message: t`Sub field name "${subFieldName}" is not a known property of conditional display context key "${contextKey}"`,
          userFriendlyMessage: msg`Conditional display rule sub field is not valid`,
          value: subFieldName,
        },
      ];
    }
    case 'selectedRecordPath': {
      if (CONDITIONAL_DISPLAY_SUB_FIELD_NAME_PATH_PATTERN.test(subFieldName)) {
        return [];
      }

      return [
        {
          code: invalidDataCode,
          message: t`Sub field name "${subFieldName}" of conditional display context key "${contextKey}" must be a dotted path of identifiers`,
          userFriendlyMessage: msg`Conditional display rule sub field is not valid`,
          value: subFieldName,
        },
      ];
    }
  }
};
