export type LogicFunctionUserCaller = {
  type: 'user';
  userId: string;
  userWorkspaceId: string;
  workspaceMemberId?: string;
};

export type LogicFunctionApiKeyCaller = {
  type: 'apiKey';
  apiKeyId: string;
};

export type LogicFunctionCaller =
  | LogicFunctionUserCaller
  | LogicFunctionApiKeyCaller;
