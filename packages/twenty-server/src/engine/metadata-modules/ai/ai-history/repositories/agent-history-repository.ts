import { assertAgentMessageSenderFields } from 'src/engine/metadata-modules/ai/ai-history/utils/assert-agent-message-sender-fields.util';
import { addAgentMessageSenderWorkspaceMember } from 'src/engine/metadata-modules/ai/ai-history/utils/add-agent-message-sender-workspace-member.util';
import { hydrateAgentHistoryFiles } from 'src/engine/metadata-modules/ai/ai-history/utils/hydrate-agent-history-files.util';
import { removeAgentHistoryFileRelations } from 'src/engine/metadata-modules/ai/ai-history/utils/remove-agent-history-file-relations.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { type FindOptionsWhere, type ObjectLiteral } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

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
      'run'
    >,
    private readonly workspaceOrmManager: Pick<
      WorkspaceOrmManager,
      'executeInWorkspaceContext' | 'getRepository'
    >,
  ) {}

  private run<TResult>(
    workspaceId: string,
    work: (
      repository: WorkspaceRepository<TRecord>,
      context: AgentHistoryStorageContext,
    ) => Promise<TResult>,
  ): Promise<TResult> {
    return this.storageService.run(workspaceId, (context) =>
      this.workspaceOrmManager.executeInWorkspaceContext(
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
      ),
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
      if (this.name === 'agentMessage') assertAgentMessageSenderFields();
      return repository.insert(
        await this.addSenderRelation(values, workspaceId, context),
      );
    });
  }

  insertAndReturnOne(
    workspaceId: string,
    values: QueryDeepPartialEntity<TRecord>,
  ): Promise<TRecord> {
    return this.run(workspaceId, async (repository, context) => {
      if (this.name === 'agentMessage') assertAgentMessageSenderFields();
      const result = await repository.insert(
        await this.addSenderRelation(values, workspaceId, context),
      );
      return result.raw[0] as TRecord;
    });
  }

  private async addSenderRelation(
    values: QueryDeepPartialEntity<TRecord> | QueryDeepPartialEntity<TRecord>[],
    workspaceId: string,
    context: AgentHistoryStorageContext,
  ) {
    const records: ObjectLiteral[] = Array.isArray(values) ? values : [values];
    return this.name === 'agentMessage' &&
      records.some((record) => isNonEmptyString(record.senderUserWorkspaceId))
      ? await addAgentMessageSenderWorkspaceMember(values, workspaceId, context)
      : values;
  }

  update(
    workspaceId: string,
    where: FindOptionsWhere<TRecord>,
    values: QueryDeepPartialEntity<TRecord>,
  ) {
    return this.run(workspaceId, async (repository) => {
      const result = await repository
        .createQueryBuilder()
        .withDeleted()
        .where(where)
        .update()
        .set(values)
        .returning(['id'])
        .execute();
      return {
        affected: result.generatedMaps.length,
        generatedMaps: result.generatedMaps,
        raw: result.generatedMaps,
      };
    });
  }

  delete(workspaceId: string, where: FindOptionsWhere<TRecord>) {
    return this.run(workspaceId, async (repository) => {
      const result = await repository
        .createQueryBuilder()
        .withDeleted()
        .where(where)
        .delete()
        .returning(['id'])
        .execute();
      return {
        affected: result.generatedMaps.length,
        generatedMaps: result.generatedMaps,
        raw: result.generatedMaps,
      };
    });
  }

  upsert(
    workspaceId: string,
    values: QueryDeepPartialEntity<TRecord>,
    conflictPaths: string[],
  ) {
    return this.run(workspaceId, async (repository, context) => {
      if (this.name === 'agentMessage') assertAgentMessageSenderFields();
      // Workspace upsert selects before inserting. Serialize concurrent stream
      // checkpoints for the same identity so both cannot take the insert path.
      const valuesByField: ObjectLiteral = values;
      const identity = [...conflictPaths]
        .sort()
        .map((field) => [field, valuesByField[field]]);
      await context.manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [
          `agent-history-upsert:${workspaceId}:${this.name}:${JSON.stringify(identity)}`,
        ],
      );
      return repository.upsert(
        (await this.addSenderRelation(
          values,
          workspaceId,
          context,
        )) as QueryDeepPartialEntity<TRecord>,
        conflictPaths,
      );
    });
  }

  query<TResult>(
    workspaceId: string,
    work: (context: AgentHistoryStorageContext) => Promise<TResult>,
  ): Promise<TResult> {
    return this.storageService.run(workspaceId, work);
  }
}
