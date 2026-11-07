import {
  type FieldMetadataType,
  type PageLayoutFilterCondition,
} from 'twenty-shared/types';
import { isDefined, isRecordFilterValueValid } from 'twenty-shared/utils';

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

  return isRecordFilterValueValid({ operand, value })
    ? undefined
    : { kind: 'MISSING_VALUE' };
};
