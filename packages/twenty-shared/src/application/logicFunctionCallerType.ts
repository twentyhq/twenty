export type LogicFunctionUserCaller = {
  kind: 'user';
  userId: string;
  userWorkspaceId: string;
  workspaceMemberId?: string;
};

export type LogicFunctionApiKeyCaller = {
  kind: 'apiKey';
  apiKeyId: string;
};

export type LogicFunctionCaller =
  | LogicFunctionUserCaller
  | LogicFunctionApiKeyCaller;
