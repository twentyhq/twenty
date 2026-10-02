import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export type AgentInboxSender =
  | { type: 'application'; application: FlatApplication }
  | { type: 'workflow'; workflowId: string; workflowName: string };
