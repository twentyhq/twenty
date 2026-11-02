import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { type AgentHistoryTransactionScope } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-transaction-scope.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

const AGENT_HISTORY_UPSERT_LOCK_KEY_PREFIX = 'agent-history-upsert:';

export const createAgentHistoryTransactionScope = (
  transactionScope: WorkspaceTransactionScope,
): AgentHistoryTransactionScope => {
  const getRepository = (name: AgentHistoryObjectName) =>
    transactionScope.getRepository(
      name,
      { shouldBypassPermissionChecks: true },
      { shouldSkipEventEmission: true },
    );

  return {
    executeRawQuery: transactionScope.executeRawQuery,
    insert: async (name, values) => {
      await getRepository(name).insert(values);
    },
    update: async (name, where, values) => {
      const result = await getRepository(name).update(where, values);

      return result.generatedMaps.length;
    },
    upsert: async (name, values, conflictPaths) => {
      const identity = [...conflictPaths]
        .sort()
        .map((field) => [field, values[field]]);

      await transactionScope.executeRawQuery(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [
          `${AGENT_HISTORY_UPSERT_LOCK_KEY_PREFIX}${transactionScope.workspaceId}:${name}:${JSON.stringify(identity)}`,
        ],
      );
      await getRepository(name).upsert(values, conflictPaths);
    },
    delete: async (name, where) => {
      await getRepository(name).delete(where);
    },
  };
};
