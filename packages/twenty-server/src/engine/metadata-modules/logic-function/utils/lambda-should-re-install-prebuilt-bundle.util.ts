import { isNonEmptyString } from '@sniptt/guards';

import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export const lambdaShouldReInstallPrebuiltBundle = ({
  existingLogicFunction,
  newLogicFunction,
}: {
  existingLogicFunction: FlatLogicFunction;
  newLogicFunction: FlatLogicFunction;
}): boolean => {
  if (
    newLogicFunction.executionMode !== LogicFunctionExecutionMode.PREBUILT ||
    !newLogicFunction.isBuildUpToDate ||
    !isNonEmptyString(newLogicFunction.checksum)
  ) {
    return false;
  }

  const isAlreadyInstalled =
    existingLogicFunction.executionMode ===
      LogicFunctionExecutionMode.PREBUILT &&
    existingLogicFunction.checksum === newLogicFunction.checksum;

  return !isAlreadyInstalled;
};
