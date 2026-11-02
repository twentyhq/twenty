import { Injectable } from '@nestjs/common';

import { type AgentHistoryTransactionScope } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-transaction-scope.type';
import { createAgentHistoryTransactionScope } from 'src/engine/metadata-modules/ai/ai-history/utils/create-agent-history-transaction-scope.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class AgentHistoryTransactionService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async run<TResult>({
    workspaceId,
    work,
  }: {
    workspaceId: string;
    work: (scope: AgentHistoryTransactionScope) => Promise<TResult>;
  }): Promise<TResult> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction((transactionScope) =>
          work(createAgentHistoryTransactionScope(transactionScope)),
        ),
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }
}
