import {
  type FieldMetadataType,
  type PageLayoutFilterCondition,
} from 'twenty-shared/types';
import {
  getDashboardFilterConditionValueIssue,
  getFilterTypeFromFieldType,
  isDefined,
  isRecordFilterValueValid,
} from 'twenty-shared/utils';

import {
  type FilterConditionValidationIssue,
  getFilterConditionValidationIssue,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/get-filter-condition-validation-issue.util';

export type PageLayoutFilterConditionValidationIssue =
  | FilterConditionValidationIssue
  | { kind: 'MISSING_VALUE' };

export const getPageLayoutFilterConditionValidationIssue = ({
  condition: { operand, value },
  valueFormatFieldType,
}: {
  condition: PageLayoutFilterCondition;
  valueFormatFieldType: FieldMetadataType;
}): PageLayoutFilterConditionValidationIssue | undefined => {
  const issue = getFilterConditionValidationIssue({
    fieldType: valueFormatFieldType,
    operand,
    value,
  });

  if (isDefined(issue)) {
    return issue;
  }

  if (!isRecordFilterValueValid({ operand, value })) {
    return { kind: 'MISSING_VALUE' };
  }

  const dashboardFilterValueIssue = getDashboardFilterConditionValueIssue({
    operand,
    value,
  });

  if (!isDefined(dashboardFilterValueIssue)) {
    return undefined;
  }

  return {
    kind: 'INVALID_VALUE',
    stringifiedValue: value,
    operand,
    filterType: getFilterTypeFromFieldType(valueFormatFieldType),
    hint: dashboardFilterValueIssue,
  };
};
