import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type FieldMetadataType,
  type PageLayoutFilterCondition,
  type PageLayoutFilterValue,
} from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { getPageLayoutFilterConditionValidationIssue } from 'src/engine/metadata-modules/flat-page-layout/utils/get-page-layout-filter-condition-validation-issue.util';
import { PageLayoutExceptionCode } from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type PageLayoutFilterValidationError =
  FlatEntityValidationError<PageLayoutExceptionCode>;

const validateCondition = ({
  condition: { operand, value },
  valueFormatFieldType,
  filterLabel,
}: {
  condition: PageLayoutFilterCondition;
  valueFormatFieldType: FieldMetadataType;
  filterLabel: string;
}): PageLayoutFilterValidationError[] => {
  const issue = getPageLayoutFilterConditionValidationIssue({
    condition: { operand, value },
    valueFormatFieldType,
  });

  if (issue?.kind === 'UNSUPPORTED_OPERAND') {
    const allowedOperandsText = issue.allowedOperands.join(', ');

    return [
      {
        code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        message: t`Operand "${operand}" of the default value of dashboard filter "${filterLabel}" is not supported. Supported operands: ${allowedOperandsText}.`,
        userFriendlyMessage: msg`Dashboard filter operand is not supported`,
        value: operand,
      },
    ];
  }

  if (issue?.kind === 'INVALID_VALUE') {
    const { stringifiedValue, hint } = issue;

    return [
      {
        code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        message: isNonEmptyString(hint)
          ? t`Value "${stringifiedValue}" of the default value of dashboard filter "${filterLabel}" is not valid for operand "${operand}". ${hint}`
          : t`Value "${stringifiedValue}" of the default value of dashboard filter "${filterLabel}" is not valid for operand "${operand}".`,
        userFriendlyMessage: msg`Dashboard filter default value is not valid for this operand`,
        value,
      },
    ];
  }

  if (issue?.kind === 'MISSING_VALUE') {
    return [
      {
        code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        message: t`Operand "${operand}" of the default value of dashboard filter "${filterLabel}" has no value`,
        userFriendlyMessage: msg`Dashboard filter default value is empty`,
        value,
      },
    ];
  }

  return [];
};

export const validatePageLayoutFilterDefaultValue = ({
  defaultValue,
  valueFormatFieldType,
  filterLabel,
}: {
  defaultValue: PageLayoutFilterValue;
  valueFormatFieldType: FieldMetadataType;
  filterLabel: string;
}): PageLayoutFilterValidationError[] => {
  if (!isNonEmptyArray(defaultValue.conditions)) {
    return [
      {
        code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        message: t`The default value of dashboard filter "${filterLabel}" has no condition. Use null for no default value.`,
        userFriendlyMessage: msg`A dashboard filter default value needs at least one condition`,
      },
    ];
  }

  return defaultValue.conditions.flatMap((condition) =>
    validateCondition({ condition, valueFormatFieldType, filterLabel }),
  );
};
