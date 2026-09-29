import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { buildUniversalFlatLogicFunctionToCreate } from 'src/engine/metadata-modules/logic-function/utils/build-universal-flat-logic-function-to-create.util';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';

export const buildDuplicatedCodeStepLogicFunctionToCreate = ({
  existingLogicFunction,
  id,
  sourceHandlerPath,
  builtHandlerPath,
  checksum,
  isBuildUpToDate,
  applicationUniversalIdentifier,
}: Pick<
  UniversalFlatLogicFunction,
  | 'sourceHandlerPath'
  | 'builtHandlerPath'
  | 'checksum'
  | 'isBuildUpToDate'
  | 'applicationUniversalIdentifier'
> & {
  existingLogicFunction: Pick<
    FlatLogicFunction,
    | 'name'
    | 'description'
    | 'timeoutSeconds'
    | 'handlerName'
    | 'workflowActionTriggerSettings'
  >;
  id: string;
}): UniversalFlatLogicFunction & { id: string } => {
  return buildUniversalFlatLogicFunctionToCreate({
    id,
    name: existingLogicFunction.name,
    description: existingLogicFunction.description,
    timeoutSeconds: existingLogicFunction.timeoutSeconds,
    handlerName: existingLogicFunction.handlerName,
    workflowActionTriggerSettings:
      existingLogicFunction.workflowActionTriggerSettings,
    executionMode: LogicFunctionExecutionMode.LIVE,
    sourceHandlerPath,
    builtHandlerPath,
    checksum,
    isBuildUpToDate,
    applicationUniversalIdentifier,
  });
};
