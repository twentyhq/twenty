import { isObject } from '@sniptt/guards';
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

    // A rich text value must be the { blocknote, markdown } object shape. A bare
    // string crashes the workflow executor when resolving variables and is later
    // rejected by the record write layer, so reject it at the source.
    if (isDefined(fieldValue) && !isObject(fieldValue)) {
      throw new WorkflowVersionStepException(
        `Rich text field "${fieldName}" in step "${stepLabel}" must be an object, received ${typeof fieldValue}.`,
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      );
    }
  }
};
