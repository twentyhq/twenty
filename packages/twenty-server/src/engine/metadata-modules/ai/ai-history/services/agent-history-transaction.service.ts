import { Injectable } from '@nestjs/common';

import { AgentHistoryWorkspaceStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { type AgentHistoryTransactionScope } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-transaction-scope.type';
import { addAgentMessageSenderWorkspaceMember } from 'src/engine/metadata-modules/ai/ai-history/utils/add-agent-message-sender-workspace-member.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class AgentHistoryTransactionService {
  constructor(
    private readonly storageService: AgentHistoryWorkspaceStorageService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  run<TResult>(
    workspaceId: string,
    work: (scope: AgentHistoryTransactionScope) => Promise<TResult>,
  ): Promise<TResult> {
    return this.storageService.run(workspaceId, (context) =>
      this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager.runInWorkspaceTransaction(
            (transactionScope) => {
              const getRepository = (name: AgentHistoryObjectName) =>
                transactionScope.getRepository(
                  name,
                  { shouldBypassPermissionChecks: true },
                  { shouldSkipEventEmission: true },
                );

              return work({
                insert: async (name, values) => {
                  await getRepository(name).insert(
                    await addAgentMessageSenderWorkspaceMember(
                      name,
                      values,
                      workspaceId,
                      context,
                    ),
                  );
                },
                update: async (name, where, values) => {
                  const result = await getRepository(name).update(
                    where,
                    values,
                  );

                  return result.generatedMaps.length;
                },
              });
            },
          ),
        buildSystemAuthContext(workspaceId),
        { lite: true },
      ),
    );
  }
}
