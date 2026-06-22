import { type LogicFunctionHttpResponse } from '@/types/LogicFunctionResponse';

export type ServerLogicFunctionResult = {
  workspaceIds: string[];
  response?: LogicFunctionHttpResponse;
};
