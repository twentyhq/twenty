import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type EntityManager } from 'typeorm';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type InboxObjectNamesByLegacyName,
  type LegacyInboxObjectName,
} from 'twenty-shared/ai';
import { doNotTranslate } from 'twenty-shared/i18n';

import { InboxObjectNamesResolverService } from 'src/engine/metadata-modules/ai/ai-history/services/inbox-object-names-resolver.service';
import { getWorkspaceAgentHistoryTable } from 'src/engine/metadata-modules/ai/ai-history/utils/get-workspace-agent-history-table.util';

export type AgentHistoryStorageContext = {
  manager: EntityManager;
  table: (name: LegacyInboxObjectName) => string;
  inboxObjectNamesByLegacyName: InboxObjectNamesByLegacyName;
};

@Injectable()
export class AgentHistoryWorkspaceStorageService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(InboxObjectNamesResolverService)
    private readonly inboxObjectNamesResolverService: Pick<
      InboxObjectNamesResolverService,
      'resolve'
    >,
  ) {}

  async getContext(workspaceId: string): Promise<AgentHistoryStorageContext> {
    if (!isNonEmptyString(workspaceId)) {
      throw new AgentHistoryStorageException({
        code: 'INVALID_WORKSPACE',
        message: doNotTranslate('Agent history requires a workspace ID'),
      });
    }

    const inboxObjectNamesByLegacyName =
      await this.inboxObjectNamesResolverService.resolve(workspaceId);
    const getTable = getWorkspaceAgentHistoryTable(workspaceId);

    return {
      manager: this.dataSource.manager,
      table: (name) => getTable(inboxObjectNamesByLegacyName[name]),
      inboxObjectNamesByLegacyName,
    };
  }

  async run<TResult>(
    workspaceId: string,
    work: (context: AgentHistoryStorageContext) => Promise<TResult>,
  ): Promise<TResult> {
    const { table, inboxObjectNamesByLegacyName } =
      await this.getContext(workspaceId);

    return this.dataSource.transaction((manager) =>
      work({ manager, table, inboxObjectNamesByLegacyName }),
    );
  }
}
