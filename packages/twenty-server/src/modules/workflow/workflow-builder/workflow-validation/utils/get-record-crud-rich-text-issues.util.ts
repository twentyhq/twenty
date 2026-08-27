import { richTextValueSchema } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowValidationIssue } from 'twenty-shared/workflow';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { findRichTextFieldNames } from 'src/modules/workflow/workflow-executor/utils/find-rich-text-field-names.util';

export const getRecordCrudRichTextIssues = ({
  objectRecord,
  objectMetadataInfo,
  stepLabel,
  stepId,
}: {
  objectRecord: Record<string, unknown>;
  objectMetadataInfo: ObjectMetadataInfo;
  stepLabel: string;
  stepId?: string;
}): WorkflowValidationIssue[] => {
  const richTextFieldNames = findRichTextFieldNames(objectMetadataInfo);

  const issues: WorkflowValidationIssue[] = [];

  for (const fieldName of richTextFieldNames) {
    const fieldValue = objectRecord[fieldName];

    if (
      isDefined(fieldValue) &&
      !richTextValueSchema.safeParse(fieldValue).success
    ) {
      issues.push({
        severity: 'error',
        code: 'INVALID_RICH_TEXT_FIELD',
        message: `Rich text field "${fieldName}" in step "${stepLabel}" must be a valid rich text value with { blocknote, markdown }.`,
        stepId,
      });
    }
  }

  return issues;
};
