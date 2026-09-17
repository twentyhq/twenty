import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { getPickRecordLoadBalanceConfigError } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-pick-record-load-balance-config-error.util';
import {
  type WorkflowAction,
  type WorkflowPickRecordAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const assertPickRecordLoadBalanceConfigIsValid = ({
  steps,
  objectIdByNameSingular,
  flatFieldMetadataMaps,
}: {
  steps: WorkflowAction[];
  objectIdByNameSingular: Record<string, string>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): void => {
  const pickRecordSteps = steps.filter(
    (step): step is WorkflowPickRecordAction =>
      step.type === WorkflowActionType.PICK_RECORD,
  );

  for (const step of pickRecordSteps) {
    const loadBalanceError = getPickRecordLoadBalanceConfigError({
      step,
      objectIdByNameSingular,
      flatFieldMetadataMaps,
    });

    if (isDefined(loadBalanceError)) {
      throw new WorkflowTriggerException(
        loadBalanceError,
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      );
    }
  }
};
