import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  isLogicFunctionReadyForPrebuiltInstall,
  type LogicFunctionPrebuiltStateFields,
} from 'src/engine/metadata-modules/logic-function/utils/is-logic-function-ready-for-prebuilt-install.util';

export const shouldReinstallLogicFunctionPrebuiltBundle = ({
  existingLogicFunction,
  newLogicFunction,
}: {
  existingLogicFunction: LogicFunctionPrebuiltStateFields;
  newLogicFunction: LogicFunctionPrebuiltStateFields;
}): boolean => {
  if (!isLogicFunctionReadyForPrebuiltInstall(newLogicFunction)) {
    return false;
  }

  if (
    existingLogicFunction.executionMode ===
      LogicFunctionExecutionMode.PREBUILT &&
    existingLogicFunction.checksum === newLogicFunction.checksum
  ) {
    return false;
  }

  return true;
};
