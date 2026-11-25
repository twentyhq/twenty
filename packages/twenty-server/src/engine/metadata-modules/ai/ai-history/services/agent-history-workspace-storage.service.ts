import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type EntityManager } from 'typeorm';
import { isNonEmptyString } from '@sniptt/guards';
import { doNotTranslate } from 'twenty-shared/i18n';

import { getWorkspaceAgentHistoryTable } from 'src/engine/metadata-modules/ai/ai-history/utils/get-workspace-agent-history-table.util';

export type AgentHistoryStorageContext = {
  manager: EntityManager;
  table: (name: AgentHistoryObjectName) => string;
};

@Injectable()
export class AgentHistoryWorkspaceStorageService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  getContext(workspaceId: string): AgentHistoryStorageContext {
    if (!isNonEmptyString(workspaceId)) {
      throw new AgentHistoryStorageException({
        code: 'INVALID_WORKSPACE',
        message: doNotTranslate('Agent history requires a workspace ID'),
      });
    }

    return {
      manager: this.dataSource.manager,
      table: getWorkspaceAgentHistoryTable(workspaceId),
    };
  }

  async run<TResult>(
    workspaceId: string,
    work: (context: AgentHistoryStorageContext) => Promise<TResult>,
  ): Promise<TResult> {
    const { table } = this.getContext(workspaceId);

    return this.dataSource.transaction((manager) => work({ manager, table }));
  }
}
