import { isDefined } from 'twenty-shared/utils';

import { computeExecutionFingerprint } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-execution-fingerprint.util';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';

export const computeLogicFunctionExecutionFingerprint = (
  logicFunction: Pick<
    UniversalFlatLogicFunction,
    'checksum' | 'handlerName' | 'runtime' | 'workflowActionTriggerSettings'
  >,
): string =>
  computeExecutionFingerprint({
    checksum: logicFunction.checksum ?? null,
    handlerName: logicFunction.handlerName,
    runtime: logicFunction.runtime,
    isExposedAsWorkflowAction: isDefined(
      logicFunction.workflowActionTriggerSettings,
    ),
  });
