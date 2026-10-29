import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export type AgentChatCaller =
  | { type: 'workspaceMember'; workspaceMemberId: string }
  | {
      type: 'applicationWithoutUser';
      application: Pick<FlatApplication, 'id' | 'defaultRoleId'>;
    };
