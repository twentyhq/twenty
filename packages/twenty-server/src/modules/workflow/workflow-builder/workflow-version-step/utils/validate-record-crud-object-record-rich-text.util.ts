import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { getRecordCrudRichTextIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-record-crud-rich-text-issues.util';

export const validateRecordCrudObjectRecordRichTextOrThrow = ({
  objectRecord,
  objectMetadataInfo,
  stepLabel,
}: {
  objectRecord: Record<string, unknown>;
  objectMetadataInfo: ObjectMetadataInfo;
  stepLabel: string;
}): void => {
  const issues = getRecordCrudRichTextIssues({
    objectRecord,
    objectMetadataInfo,
    stepLabel,
  });

  if (issues.length > 0) {
    throw new WorkflowVersionStepException(
      issues[0].message,
      WorkflowVersionStepExceptionCode.INVALID_REQUEST,
    );
  }
};
