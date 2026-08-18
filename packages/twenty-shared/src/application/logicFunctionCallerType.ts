import { type LogicFunctionApiKeyCaller } from './logicFunctionApiKeyCallerType';
import { type LogicFunctionUserCaller } from './logicFunctionUserCallerType';

export type LogicFunctionCaller =
  | LogicFunctionUserCaller
  | LogicFunctionApiKeyCaller;
