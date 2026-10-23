import { type ObjectLiteral } from 'typeorm';

import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';

export type AgentHistoryTransactionScope = {
  executeRawQuery: <
    TRecord extends ObjectLiteral = Record<string, unknown>,
  >(args: {
    sql: string;
    parameters?: unknown[];
  }) => Promise<TRecord[]>;
  afterCommit: (callback: () => void | Promise<void>) => void;
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
