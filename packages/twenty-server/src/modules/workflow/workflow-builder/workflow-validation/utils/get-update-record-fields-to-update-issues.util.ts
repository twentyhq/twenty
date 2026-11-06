import { isArray, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { getWorkflowRecordKeysByFieldReference } from 'src/modules/workflow/workflow-executor/utils/get-workflow-record-keys-by-field-reference.util';
import { type WorkflowUpdateRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const FIELDS_TO_UPDATE_PATH = 'settings.input.fieldsToUpdate';

const FIELDS_TO_UPDATE_HINT =
  'Use field names of the object; a relation can also be named by its join column (company or companyId).';

export const getUpdateRecordFieldsToUpdateIssues = ({
  step,
  objectMetadataInfo,
  sourceFieldsToUpdate,
}: {
  step: Pick<WorkflowUpdateRecordAction, 'id' | 'name' | 'settings'>;
  objectMetadataInfo: ObjectMetadataInfo;
  // Set on writes: unknown names the source content already had for this object may stay, new ones are refused
  sourceFieldsToUpdate?: string[];
}): WorkflowValidationIssue[] => {
  const { fieldsToUpdate } = step.settings.input;

  // Writes run these checks on caller input its schema has not validated yet
  if (!isArray(fieldsToUpdate)) {
    return [];
  }

  const recordKeysByFieldReference =
    getWorkflowRecordKeysByFieldReference(objectMetadataInfo);

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

  const stepLabel = step.name ?? step.id;
  const objectName = objectMetadataInfo.flatObjectMetadata.nameSingular;

  const issues: WorkflowValidationIssue[] = [
    {
      severity: 'error',
      code: 'FIELD_NOT_FOUND',
      message: `Step "${stepLabel}" updates fields that "${objectName}" does not have: ${unknownFieldNames.join(', ')}. Remove them before activating.`,
      stepId: step.id,
      path: FIELDS_TO_UPDATE_PATH,
      hint: FIELDS_TO_UPDATE_HINT,
    },
  ];

  if (!isDefined(sourceFieldsToUpdate)) {
    return issues;
  }

  const introducedUnknownFieldNames = unknownFieldNames.filter(
    (fieldName) => !sourceFieldsToUpdate.includes(fieldName),
  );

  if (introducedUnknownFieldNames.length > 0) {
    issues.push({
      severity: 'error',
      code: 'INVALID_FIELD_TO_UPDATE',
      message: `Step "${stepLabel}" updates unknown fields of "${objectName}": ${introducedUnknownFieldNames.join(', ')}.`,
      stepId: step.id,
      path: FIELDS_TO_UPDATE_PATH,
      hint: FIELDS_TO_UPDATE_HINT,
    });
  }

  return issues;
};
