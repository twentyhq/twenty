import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type FieldMetadataType,
  type PageLayoutFilterValue,
} from 'twenty-shared/types';
import {
  getFilterOperandsForFilterableFieldType,
  getFilterTypeFromFieldType,
  getFilterValueValidationIssue,
  isDefined,
} from 'twenty-shared/utils';

import { PageLayoutExceptionCode } from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validatePageLayoutFilterDefaultValue = ({
  defaultValue,
  fieldType,
  filterLabel,
}: {
  defaultValue: PageLayoutFilterValue;
  fieldType: FieldMetadataType;
  filterLabel: string;
}): FlatEntityValidationError<PageLayoutExceptionCode>[] => {
  const allowedOperands = getFilterOperandsForFilterableFieldType({
    filterType: getFilterTypeFromFieldType(fieldType),
  });

  return defaultValue.conditions.flatMap(({ operand, value }) => {
    if (!allowedOperands.includes(operand)) {
      const allowedOperandsText = allowedOperands.join(', ');

      return [
        {
          code: PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
          message: t`Operand "${operand}" of the default value of dashboard filter "${filterLabel}" is not supported. Supported operands: ${allowedOperandsText}.`,
          userFriendlyMessage: msg`Dashboard filter operand is not supported`,
          value: operand,
        },
      ];
    }

    const issue = getFilterValueValidationIssue({ fieldType, operand, value });

    if (!isDefined(issue)) {
      return [];
    }

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
  });
};
