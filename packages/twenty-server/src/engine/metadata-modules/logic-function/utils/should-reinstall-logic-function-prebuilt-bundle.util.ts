import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  isLogicFunctionPrebuiltStateValid,
  type LogicFunctionPrebuiltStateFields,
} from 'src/engine/metadata-modules/logic-function/utils/is-logic-function-prebuilt-state-valid.util';

export const shouldReinstallLogicFunctionPrebuiltBundle = ({
  existingLogicFunction,
  newLogicFunction,
}: {
  existingLogicFunction: LogicFunctionPrebuiltStateFields;
  newLogicFunction: LogicFunctionPrebuiltStateFields;
}): boolean => {
  if (
    newLogicFunction.executionMode !== LogicFunctionExecutionMode.PREBUILT ||
    !isLogicFunctionPrebuiltStateValid(newLogicFunction)
  ) {
    return false;
  }

  const isSameChecksumAlreadyInstalled =
    existingLogicFunction.executionMode ===
      LogicFunctionExecutionMode.PREBUILT &&
    existingLogicFunction.checksum === newLogicFunction.checksum;

  return !isSameChecksumAlreadyInstalled;
};
