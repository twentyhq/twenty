import { isNonEmptyString } from '@sniptt/guards';

import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export type LogicFunctionPrebuiltStateFields = Pick<
  FlatLogicFunction,
  'executionMode' | 'isBuildUpToDate' | 'checksum'
>;

export const isLogicFunctionReadyForPrebuiltInstall = (
  flatLogicFunction: LogicFunctionPrebuiltStateFields,
): boolean =>
  flatLogicFunction.executionMode === LogicFunctionExecutionMode.PREBUILT &&
  flatLogicFunction.isBuildUpToDate === true &&
  isNonEmptyString(flatLogicFunction.checksum);
