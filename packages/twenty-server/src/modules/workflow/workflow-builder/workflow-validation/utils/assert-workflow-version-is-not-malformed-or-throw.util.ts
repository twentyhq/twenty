import {
  MALFORMED_WORKFLOW_VALIDATION_ISSUE_CODES,
  validateWorkflowStructure,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  WorkflowVersionValidationException,
  WorkflowVersionValidationExceptionCode,
} from 'src/modules/workflow/workflow-builder/workflow-validation/exceptions/workflow-version-validation.exception';
import { getWorkflowRecordStepMetadataIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-workflow-record-step-metadata-issues.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

type WorkflowVersionMalformedCheckArgs = {
  trigger: WorkflowTrigger | null | undefined;
  steps: WorkflowAction[] | null | undefined;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  objectIdByNameSingular: Record<string, string>;
};

const getMalformedWorkflowVersionIssues = ({
  trigger,
  steps,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  objectIdByNameSingular,
}: WorkflowVersionMalformedCheckArgs): WorkflowValidationIssue[] => {
  const structureResult = validateWorkflowStructure({ trigger, steps });

  return [
    ...structureResult.errors,
    ...getWorkflowRecordStepMetadataIssues({
      steps: steps ?? [],
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    }),
  ].filter((issue) =>
    MALFORMED_WORKFLOW_VALIDATION_ISSUE_CODES.has(issue.code),
  );
};

export const assertWorkflowVersionIsNotMalformedOrThrow = (
  args: WorkflowVersionMalformedCheckArgs,
): void => {
  const malformedIssues = getMalformedWorkflowVersionIssues(args);

  if (malformedIssues.length === 0) {
    return;
  }

  throw new WorkflowVersionValidationException(
    WorkflowVersionValidationExceptionCode.MALFORMED_WORKFLOW_VERSION,
    malformedIssues,
  );
};
