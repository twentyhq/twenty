import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { isNonEmptyString } from '@sniptt/guards';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-storage-context.type';
import { type AgentHistoryObjectMetadataMaps } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-metadata-maps.type';
import { resolveAgentHistoryObjectNameOrThrow } from 'src/engine/metadata-modules/ai/ai-history/utils/resolve-agent-history-object-name-or-throw.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AgentHistoryWorkspaceStorageService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(WorkspaceCacheService)
    private readonly workspaceCacheService: Pick<
      WorkspaceCacheService,
      'getOrRecompute'
    >,
  ) {}

  async getContext({
    workspaceId,
    flatObjectMetadataMaps: suppliedFlatObjectMetadataMaps,
  }: {
    workspaceId: string;
    flatObjectMetadataMaps?: AgentHistoryObjectMetadataMaps;
  }): Promise<AgentHistoryStorageContext> {
    if (!isNonEmptyString(workspaceId)) {
      throw new AgentHistoryStorageException(
        'INVALID_WORKSPACE',
        'Agent history requires a workspace ID',
      );
    }

    const flatObjectMetadataMaps =
      suppliedFlatObjectMetadataMaps ??
      (
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
        ])
      ).flatObjectMetadataMaps;
    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

    return {
      manager: this.dataSource.manager,
      table: (objectName) =>
        `${schemaName}.${escapeIdentifier(
          resolveAgentHistoryObjectNameOrThrow({
            objectName,
            flatObjectMetadataMaps,
          }),
        )}`,
    };
  }

  async run<TResult>(
    workspaceId: string,
    work: (context: AgentHistoryStorageContext) => Promise<TResult>,
  ): Promise<TResult> {
    const { table } = await this.getContext({ workspaceId });

    return this.dataSource.transaction((manager) => work({ manager, table }));
  }
}
