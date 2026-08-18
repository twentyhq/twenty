export type LogicFunctionUserCaller = {
  type: 'user';
  userId: string;
  userWorkspaceId: string;
  workspaceMemberId?: string;
};
