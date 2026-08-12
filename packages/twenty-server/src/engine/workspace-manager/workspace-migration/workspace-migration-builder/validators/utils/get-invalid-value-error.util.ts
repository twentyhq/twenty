import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType, type ViewFilterOperand } from 'twenty-shared/types';
import { getFilterValueValidationIssue, isDefined } from 'twenty-shared/utils';

import { getEffectiveFilterFieldType } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-effective-filter-field-type.util';
import { ViewFilterExceptionCode } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { type ViewFilterValue } from 'src/engine/metadata-modules/view-filter/types/view-filter-value.type';

export const getInvalidValueError = ({
  operand,
  fieldType,
  subFieldName,
  relationTargetFieldType,
  value,
}: {
  operand: ViewFilterOperand;
  fieldType: FieldMetadataType;
  subFieldName: string | null | undefined;
  relationTargetFieldType: FieldMetadataType | undefined;
  value: ViewFilterValue;
}) => {
  const issue = getFilterValueValidationIssue({
    fieldType: getEffectiveFilterFieldType({
      fieldType,
      relationTargetFieldType,
    }),
    operand,
    subFieldName,
    value,
  });

  if (!isDefined(issue)) {
    return undefined;
  }

  const { stringifiedValue, filterType, hint } = issue;

  return {
    code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
    message: isNonEmptyString(hint)
      ? t`Value "${stringifiedValue}" is not valid for operand "${operand}" on field type "${filterType}". ${hint}`
      : t`Value "${stringifiedValue}" is not valid for operand "${operand}" on field type "${filterType}".`,
    userFriendlyMessage: msg`Filter value is not valid for this operand`,
  };
};
