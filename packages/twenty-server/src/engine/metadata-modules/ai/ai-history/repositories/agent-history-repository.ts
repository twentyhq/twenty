import { addAgentMessageSenderWorkspaceMember } from 'src/engine/metadata-modules/ai/ai-history/utils/add-agent-message-sender-workspace-member.util';
import { hydrateAgentHistoryFiles } from 'src/engine/metadata-modules/ai/ai-history/utils/hydrate-agent-history-files.util';
import { removeAgentHistoryFileRelations } from 'src/engine/metadata-modules/ai/ai-history/utils/remove-agent-history-file-relations.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { type FindOptionsWhere } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { isDefined } from 'twenty-shared/utils';

import {
  type AgentHistoryWorkspaceStorageService,
  type AgentHistoryStorageContext,
} from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import {
  type WorkspaceFindOptions,
  normalizeFindOptionsRelations,
} from 'src/engine/twenty-orm/query-builder/utils/apply-find-options.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

export class AgentHistoryRepository<TRecord extends { id: string }> {
  constructor(
    private readonly name: AgentHistoryObjectName,
    private readonly storageService: Pick<
      AgentHistoryWorkspaceStorageService,
      'run' | 'getContext'
    >,
    private readonly workspaceOrmManager: Pick<
      WorkspaceOrmManager,
      'executeInWorkspaceContext' | 'getRepository'
    >,
  ) {}

  private async run<TResult>(
    workspaceId: string,
    work: (
      repository: WorkspaceRepository<TRecord>,
      context: AgentHistoryStorageContext,
    ) => Promise<TResult>,
  ): Promise<TResult> {
    const context = await this.storageService.getContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        work(
          this.workspaceOrmManager.getRepository<TRecord>(
            this.name,
            { shouldBypassPermissionChecks: true },
            { shouldSkipEventEmission: true },
          ),
          context,
        ),
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }

  async find(
    workspaceId: string,
    options?: WorkspaceFindOptions,
  ): Promise<TRecord[]> {
    return this.run(workspaceId, async (repository, context) => {
      const relations = normalizeFindOptionsRelations(options?.relations ?? {});
      const records = await repository.find({
        ...options,
        withDeleted: true,
        relations: removeAgentHistoryFileRelations(relations),
      });
      if (JSON.stringify(relations).includes('"file"')) {
        await hydrateAgentHistoryFiles({
          records,
          manager: context.manager,
          workspaceId,
        });
      }
      return records as TRecord[];
    });
  }

  async findOne(
    workspaceId: string,
    options: WorkspaceFindOptions,
  ): Promise<TRecord | null> {
    return (await this.find(workspaceId, { ...options, take: 1 }))[0] ?? null;
  }

  async findOneOrFail(
    workspaceId: string,
    options: WorkspaceFindOptions,
  ): Promise<TRecord> {
    const record = await this.findOne(workspaceId, options);
    if (!isDefined(record)) {
      if (this.name === 'agentChatThread') {
        throw new AiException(
          'Chat thread not found',
          AiExceptionCode.THREAD_NOT_FOUND,
        );
      }
      if (this.name === 'agentMessage') {
        throw new AiException(
          'Chat message not found',
          AiExceptionCode.MESSAGE_NOT_FOUND,
        );
      }
      throw new AgentHistoryStorageException(
        'RECORD_NOT_FOUND',
        `${this.name} not found`,
      );
    }
    return record;
  }

  count(workspaceId: string, options?: WorkspaceFindOptions): Promise<number> {
    return this.run(workspaceId, (repository) =>
      repository.count({
        ...options,
        withDeleted: true,
      }),
    );
  }

  existsBy(
    workspaceId: string,
    where: FindOptionsWhere<TRecord>,
  ): Promise<boolean> {
    return this.run(workspaceId, (repository) =>
      repository.exists({
        where,
        withDeleted: true,
      }),
    );
  }

  insert(
    workspaceId: string,
    values: QueryDeepPartialEntity<TRecord> | QueryDeepPartialEntity<TRecord>[],
  ) {
    return this.run(workspaceId, async (repository, context) => {
      return repository.insert(
        await addAgentMessageSenderWorkspaceMember({
          name: this.name,
          values,
          workspaceId,
          context,
        }),
      );
    });
  }

  insertAndReturnOne(
    workspaceId: string,
    values: QueryDeepPartialEntity<TRecord>,
  ): Promise<TRecord> {
    return this.run(workspaceId, async (repository, context) => {
      const result = await repository.insert(
        await addAgentMessageSenderWorkspaceMember({
          name: this.name,
          values,
          workspaceId,
          context,
        }),
      );
      return result.raw[0] as TRecord;
    });
  }

  update(
    workspaceId: string,
    where: FindOptionsWhere<TRecord>,
    values: QueryDeepPartialEntity<TRecord>,
  ) {
    return this.run(workspaceId, async (repository) => {
      const result = await repository.update(where, values);
      const generatedMaps = result.generatedMaps.map(
        ({ id }): Pick<TRecord, 'id'> => ({ id }),
      );
      return {
        affected: generatedMaps.length,
        generatedMaps,
        raw: generatedMaps,
      };
    });
  }

  delete(workspaceId: string, where: FindOptionsWhere<TRecord>) {
    return this.run(workspaceId, async (repository) => {
      const result = await repository.delete(where);
      return {
        affected: result.raw.length,
        generatedMaps: result.raw,
        raw: result.raw,
      };
    });
  }

  query<TResult>(
    workspaceId: string,
    work: (context: AgentHistoryStorageContext) => Promise<TResult>,
  ): Promise<TResult> {
    return this.storageService.run(workspaceId, work);
  }
}
