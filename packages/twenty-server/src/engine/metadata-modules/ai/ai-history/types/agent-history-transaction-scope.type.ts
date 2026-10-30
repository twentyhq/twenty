import { type ObjectLiteral } from 'typeorm';

import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

export type AgentHistoryTransactionScope = {
  executeRawQuery: WorkspaceTransactionScope['executeRawQuery'];
  insert: (
    name: AgentHistoryObjectName,
    values: ObjectLiteral | ObjectLiteral[],
  ) => Promise<void>;
  update: (
    name: AgentHistoryObjectName,
    where: ObjectLiteral,
    values: ObjectLiteral,
  ) => Promise<number>;
  upsert: (
    name: AgentHistoryObjectName,
    values: ObjectLiteral,
    conflictPaths: string[],
  ) => Promise<void>;
  delete: (name: AgentHistoryObjectName, where: ObjectLiteral) => Promise<void>;
};
