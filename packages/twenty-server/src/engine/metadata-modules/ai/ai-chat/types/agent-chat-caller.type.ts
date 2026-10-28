import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export type AgentChatCaller =
  | { type: 'member'; workspaceMemberId: string }
  | {
      type: 'application';
      application: Pick<FlatApplication, 'id' | 'defaultRoleId'>;
    };
