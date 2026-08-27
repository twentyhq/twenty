import { richTextValueSchema } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { findRichTextFieldNames } from 'src/modules/workflow/workflow-executor/utils/find-rich-text-field-names.util';

export const validateRecordCrudObjectRecordRichTextOrThrow = ({
  objectRecord,
  objectMetadataInfo,
  stepLabel,
}: {
  objectRecord: Record<string, unknown>;
  objectMetadataInfo: ObjectMetadataInfo;
  stepLabel: string;
}): void => {
  const richTextFieldNames = findRichTextFieldNames(objectMetadataInfo);

  for (const fieldName of richTextFieldNames) {
    const fieldValue = objectRecord[fieldName];

    if (!isDefined(fieldValue)) {
      continue;
    }

    if (!richTextValueSchema.safeParse(fieldValue).success) {
      throw new WorkflowVersionStepException(
        `Rich text field "${fieldName}" in step "${stepLabel}" must be a valid rich text value with { blocknote, markdown }.`,
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      );
    }
  }
};
