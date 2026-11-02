import { randomUUID } from 'node:crypto';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeLiteral } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const CHAT_WRITE_REJECTION_PREFIX = 'reject_chat_write_';
const CHAT_WRITE_REJECTION_OPERATIONS = {
  restore: {
    tableName: 'agentChatThread',
    triggerOperations: 'UPDATE',
    condition:
      'NEW.id = TG_ARGV[0]::uuid AND OLD."deletedAt" IS NOT NULL AND NEW."deletedAt" IS NULL',
  },
  share: {
    tableName: 'recordShare',
    triggerOperations: 'INSERT OR UPDATE',
    condition: 'NEW."recordId" = TG_ARGV[0]::uuid',
  },
};

export const runWithRejectedChatWrite = async <TResult>({
  workspaceId,
  threadId,
  operation,
  work,
}: {
  workspaceId: string;
  threadId: string;
  operation: 'restore' | 'share';
  work: () => Promise<TResult>;
}): Promise<TResult> => {
  const schema = getWorkspaceSchemaName(workspaceId);
  const triggerName = `${CHAT_WRITE_REJECTION_PREFIX}${randomUUID()}`;
  const { tableName, triggerOperations, condition } =
    CHAT_WRITE_REJECTION_OPERATIONS[operation];

  await global.testDataSource.query(
    `CREATE FUNCTION "${schema}"."${triggerName}"() RETURNS trigger LANGUAGE plpgsql AS $body$
     BEGIN
       IF ${condition} THEN RAISE EXCEPTION 'Rejected conversation test write'; END IF;
       RETURN NEW;
     END;
     $body$`,
  );

  try {
    await global.testDataSource.query(
      `CREATE TRIGGER "${triggerName}" BEFORE ${triggerOperations} ON "${schema}"."${tableName}"
       FOR EACH ROW EXECUTE FUNCTION "${schema}"."${triggerName}"(${escapeLiteral(threadId)})`,
    );

    return await work();
  } finally {
    await global.testDataSource.query(
      `DROP TRIGGER IF EXISTS "${triggerName}" ON "${schema}"."${tableName}"`,
    );
    await global.testDataSource.query(
      `DROP FUNCTION "${schema}"."${triggerName}"()`,
    );
  }
};
