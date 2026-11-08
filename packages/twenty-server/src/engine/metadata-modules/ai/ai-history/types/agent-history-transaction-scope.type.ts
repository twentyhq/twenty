import { type ObjectLiteral } from 'typeorm';

import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

export type AgentHistoryTransactionScope = {
  readonly threadId: string | null;
  executeRawQuery: WorkspaceTransactionScope['executeRawQuery'];
  insert: (args: {
    name: AgentHistoryObjectName;
    values: ObjectLiteral | ObjectLiteral[];
  }) => Promise<void>;
  update: (args: {
    name: AgentHistoryObjectName;
    where: ObjectLiteral;
    values: ObjectLiteral;
  }) => Promise<number>;
  upsert: (args: {
    name: AgentHistoryObjectName;
    values: ObjectLiteral;
    conflictPaths: string[];
  }) => Promise<void>;
  delete: (args: {
    name: AgentHistoryObjectName;
    where: ObjectLiteral;
  }) => Promise<number>;
  afterCommit: WorkspaceTransactionScope['afterCommit'];
};
