import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { getWorkflowRecordKeysByFieldReference } from 'src/modules/workflow/workflow-executor/utils/get-workflow-record-keys-by-field-reference.util';
import { type WorkflowUpdateRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getUpdateRecordFieldsToUpdateIssues = ({
  step,
  objectMetadataInfo,
}: {
  step: Pick<WorkflowUpdateRecordAction, 'id' | 'name' | 'settings'>;
  objectMetadataInfo: ObjectMetadataInfo;
}): WorkflowValidationIssue[] => {
  const recordKeysByFieldReference =
    getWorkflowRecordKeysByFieldReference(objectMetadataInfo);

  const fieldsToUpdate: unknown = step.settings.input.fieldsToUpdate;

  if (!Array.isArray(fieldsToUpdate)) {
    return [];
  }

  const unknownFieldNames = fieldsToUpdate.filter(
    (fieldName): fieldName is string =>
      isString(fieldName) &&
      !recordKeysByFieldReference.has(fieldName) &&
      // Variables are only resolved when the step runs
      !isDefined(fieldName.match(CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX)),
  );

  if (unknownFieldNames.length === 0) {
    return [];
  }

  const objectName = objectMetadataInfo.flatObjectMetadata.nameSingular;

  return [
    {
      severity: 'error',
      code: 'FIELD_NOT_FOUND',
      message: `Step "${step.name ?? step.id}" updates unknown fields of "${objectName}": ${unknownFieldNames.join(', ')}.`,
      stepId: step.id,
      path: 'settings.input.fieldsToUpdate',
      hint: 'Use field names of the object; a relation can also be named by its join column (company or companyId).',
    },
  ];
};
