import {
  mapAgentHistorySelectToWorkspace,
  mapAgentHistoryValuesToWorkspace,
  mapAgentHistoryWhereToWorkspace,
} from 'src/engine/metadata-modules/ai/ai-history/utils/agent-history-workspace-mapping.util';
import { normalizeAgentHistoryRecord } from 'src/engine/metadata-modules/ai/ai-history/utils/normalize-agent-history-record.util';
import { prepareAgentMessageSenderValues } from 'src/engine/metadata-modules/ai/ai-history/utils/prepare-agent-message-sender-values.util';
import { mapAgentHistoryOrderToWorkspace } from 'src/engine/metadata-modules/ai/ai-history/utils/map-agent-history-order-to-workspace.util';
import { hydrateAgentHistoryFiles } from 'src/engine/metadata-modules/ai/ai-history/utils/hydrate-agent-history-files.util';
import { removeAgentHistoryFileRelations } from 'src/engine/metadata-modules/ai/ai-history/utils/remove-agent-history-file-relations.util';
import {
  type AgentChatThreadOwnerFields,
  getAgentChatThreadOwnerFields,
} from 'src/engine/metadata-modules/ai/ai-history/utils/get-agent-chat-thread-owner-fields.util';
import { isUndefinedColumnError } from 'src/engine/metadata-modules/ai/ai-history/utils/is-undefined-column-error.util';
import { hydrateAgentChatThreadOwners } from 'src/engine/metadata-modules/ai/ai-history/utils/hydrate-agent-chat-thread-owners.util';
import { mapAgentChatThreadOwnerSelectToWorkspace } from 'src/engine/metadata-modules/ai/ai-history/utils/map-agent-chat-thread-owner-select-to-workspace.util';
import { mapAgentChatThreadOwnerValuesToWorkspace } from 'src/engine/metadata-modules/ai/ai-history/utils/map-agent-chat-thread-owner-values-to-workspace.util';
import { mapAgentChatThreadOwnerWhereToWorkspace } from 'src/engine/metadata-modules/ai/ai-history/utils/map-agent-chat-thread-owner-where-to-workspace.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import {
  type EntityTarget,
  type FindManyOptions,
  type FindOneOptions,
  type FindOptionsWhere,
  type ObjectLiteral,
} from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  type AgentHistoryStorageService,
  type AgentHistoryStorageContext,
} from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import {
  type WorkspaceFindOptions,
  normalizeFindOptionsRelations,
} from 'src/engine/twenty-orm/query-builder/utils/apply-find-options.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export class AgentHistoryRepository<
  TRecord extends { id: string; workspaceId: string },
> {
  constructor(
    private readonly name: AgentHistoryObjectName,
    private readonly legacyEntity: EntityTarget<TRecord>,
    private readonly storageService: AgentHistoryStorageService,
    private readonly workspaceOrmManager: Pick<
      WorkspaceOrmManager,
      'executeInWorkspaceContext' | 'getRepository'
    >,
  ) {}

  private async run<TResult>(
    workspaceId: string,
    core: (repository: WorkspaceScopedRepository<TRecord>) => Promise<TResult>,
    workspace: (
      repository: WorkspaceRepository<TRecord>,
      context: AgentHistoryStorageContext,
    ) => Promise<TResult>,
  ): Promise<TResult> {
    try {
      return await this.runInWorkspaceContext(workspaceId, core, workspace);
    } catch (error) {
      // Metadata loaded before waiting on the 2.43 owner upgrade lock can still
      // describe the dropped userWorkspaceId column. The failed statement wrote
      // nothing, so retry once with freshly loaded metadata.
      if (this.name === 'agentChatThread' && isUndefinedColumnError(error)) {
        return this.runInWorkspaceContext(workspaceId, core, workspace);
      }
      throw error;
    }
  }

  private runInWorkspaceContext<TResult>(
    workspaceId: string,
    core: (repository: WorkspaceScopedRepository<TRecord>) => Promise<TResult>,
    workspace: (
      repository: WorkspaceRepository<TRecord>,
      context: AgentHistoryStorageContext,
    ) => Promise<TResult>,
  ): Promise<TResult> {
    // Load metadata before reserving a core connection: a cold cache may itself
    // need the core pool. Holding every pool slot here would deadlock startup.
    // WorkspaceDataSourceService owns a separate pg pool. Keep the fence until
    // its write commits; the core transaction contains only coordination reads.
    // A later core COMMIT failure does not roll back an already committed write.
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.storageService.run(workspaceId, (context) => {
          if (context.storage === 'core') {
            return core(
              new WorkspaceScopedRepository(
                context.manager.getRepository(this.legacyEntity),
              ),
            );
          }
          return workspace(
            this.workspaceOrmManager.getRepository<TRecord>(
              this.name,
              { shouldBypassPermissionChecks: true },
              { shouldSkipEventEmission: true },
            ),
            context,
          );
        }),
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }

  private getOwnerFields(): AgentChatThreadOwnerFields | null {
    return this.name === 'agentChatThread'
      ? getAgentChatThreadOwnerFields()
      : null;
  }

  private async mapWorkspaceWhere(
    workspaceId: string,
    where: FindManyOptions<TRecord>['where'],
    context: AgentHistoryStorageContext,
  ): Promise<WorkspaceFindOptions['where'] | null> {
    const mapped = mapAgentHistoryWhereToWorkspace<TRecord>(this.name, where);
    const ownerFields = this.getOwnerFields();

    return isDefined(ownerFields)
      ? mapAgentChatThreadOwnerWhereToWorkspace({
          where: mapped,
          manager: context.manager,
          workspaceId,
          ownerFields,
        })
      : mapped;
  }

  private async mapWorkspaceValues(
    workspaceId: string,
    values: QueryDeepPartialEntity<TRecord> | QueryDeepPartialEntity<TRecord>[],
    context: AgentHistoryStorageContext,
  ): Promise<ObjectLiteral | ObjectLiteral[]> {
    const mapped = mapAgentHistoryValuesToWorkspace<TRecord>(this.name, values);
    const ownerFields = this.getOwnerFields();

    return isDefined(ownerFields)
      ? mapAgentChatThreadOwnerValuesToWorkspace({
          values: mapped,
          manager: context.manager,
          workspaceId,
          ownerFields,
        })
      : mapped;
  }

  private async hydrateWorkspaceOwners(
    workspaceId: string,
    records: ObjectLiteral[],
    context: AgentHistoryStorageContext,
  ): Promise<void> {
    const ownerFields = this.getOwnerFields();

    if (isDefined(ownerFields)) {
      await hydrateAgentChatThreadOwners({
        records,
        manager: context.manager,
        workspaceId,
        ownerFields,
      });
    }
  }

  async find(
    workspaceId: string,
    options?: FindManyOptions<TRecord>,
  ): Promise<TRecord[]> {
    return this.run(
      workspaceId,
      (repository) => repository.find(workspaceId, options),
      async (repository, context) => {
        const relations = normalizeFindOptionsRelations(
          (options?.relations ?? {}) as WorkspaceFindOptions['relations'] & {},
        );
        const where = await this.mapWorkspaceWhere(
          workspaceId,
          options?.where,
          context,
        );
        if (where === null) {
          return [];
        }
        const select = mapAgentHistorySelectToWorkspace(
          this.name,
          options?.select,
        );
        const ownerFields = this.getOwnerFields();
        const records = await repository.find({
          ...options,
          select: isDefined(ownerFields)
            ? mapAgentChatThreadOwnerSelectToWorkspace({ select, ownerFields })
            : select,
          order: mapAgentHistoryOrderToWorkspace(this.name, options?.order),
          where,
          withDeleted: true,
          relations: removeAgentHistoryFileRelations(relations),
        } as WorkspaceFindOptions);
        const normalized = records.map((record) =>
          normalizeAgentHistoryRecord({
            record,
            workspaceId,
            objectName: this.name,
          }),
        );
        await this.hydrateWorkspaceOwners(workspaceId, normalized, context);
        if (JSON.stringify(relations).includes('"file"')) {
          await hydrateAgentHistoryFiles({
            records: normalized,
            manager: context.manager,
            workspaceId,
          });
        }
        return normalized as TRecord[];
      },
    );
  }

  async findOne(
    workspaceId: string,
    options: FindOneOptions<TRecord>,
  ): Promise<TRecord | null> {
    return (await this.find(workspaceId, { ...options, take: 1 }))[0] ?? null;
  }

  async findOneOrFail(
    workspaceId: string,
    options: FindOneOptions<TRecord>,
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

  count(
    workspaceId: string,
    options?: FindManyOptions<TRecord>,
  ): Promise<number> {
    return this.run(
      workspaceId,
      (repository) => repository.count(workspaceId, options),
      async (repository, context) => {
        const where = await this.mapWorkspaceWhere(
          workspaceId,
          options?.where,
          context,
        );
        if (where === null) {
          return 0;
        }
        return repository.count({
          ...options,
          order: mapAgentHistoryOrderToWorkspace(this.name, options?.order),
          where,
          withDeleted: true,
        } as WorkspaceFindOptions);
      },
    );
  }

  existsBy(
    workspaceId: string,
    where: FindOptionsWhere<TRecord>,
  ): Promise<boolean> {
    return this.run(
      workspaceId,
      (repository) => repository.existsBy(workspaceId, where),
      async (repository, context) => {
        const mappedWhere = await this.mapWorkspaceWhere(
          workspaceId,
          where,
          context,
        );
        if (mappedWhere === null) {
          return false;
        }
        return repository.exists({ where: mappedWhere, withDeleted: true });
      },
    );
  }

  private async prepareWorkspaceInsert(
    workspaceId: string,
    values: QueryDeepPartialEntity<TRecord> | QueryDeepPartialEntity<TRecord>[],
    context: AgentHistoryStorageContext,
  ): Promise<ObjectLiteral | ObjectLiteral[]> {
    if (
      this.name === 'agentChatThread' &&
      ((Array.isArray(values) ? values : [values]) as ObjectLiteral[]).some(
        (value) => !isNonEmptyString(value.userWorkspaceId),
      )
    ) {
      throw new AgentHistoryStorageException(
        'INVALID_CRITERIA',
        'Chat threads require an owner',
      );
    }
    const mapped = await this.mapWorkspaceValues(workspaceId, values, context);

    return this.name === 'agentMessage'
      ? prepareAgentMessageSenderValues({
          values: mapped,
          context,
          workspaceId,
        })
      : mapped;
  }

  insert(
    workspaceId: string,
    values: QueryDeepPartialEntity<TRecord> | QueryDeepPartialEntity<TRecord>[],
  ) {
    return this.run(
      workspaceId,
      (repository) => repository.insert(workspaceId, values),
      async (repository, context) =>
        repository.insert(
          await this.prepareWorkspaceInsert(workspaceId, values, context),
        ),
    );
  }

  insertAndReturnOne(
    workspaceId: string,
    values: QueryDeepPartialEntity<TRecord>,
  ): Promise<TRecord> {
    return this.run(
      workspaceId,
      (repository) => repository.insertAndReturnOne(workspaceId, values),
      async (repository, context) => {
        const result = await repository.insert(
          await this.prepareWorkspaceInsert(workspaceId, values, context),
        );
        const record = normalizeAgentHistoryRecord({
          record: result.raw[0],
          workspaceId,
          objectName: this.name,
        });
        await this.hydrateWorkspaceOwners(workspaceId, [record], context);
        return record as TRecord;
      },
    );
  }

  update(
    workspaceId: string,
    where: FindOptionsWhere<TRecord>,
    values: QueryDeepPartialEntity<TRecord>,
  ) {
    return this.run(
      workspaceId,
      (repository) => repository.update(workspaceId, where, values),
      async (repository, context) => {
        const mappedWhere = await this.mapWorkspaceWhere(
          workspaceId,
          where,
          context,
        );
        if (mappedWhere === null) {
          return { affected: 0, generatedMaps: [], raw: [] };
        }
        const result = await repository
          .createQueryBuilder()
          .withDeleted()
          .where((mappedWhere ?? {}) as ObjectLiteral)
          .update()
          .set(
            (await this.mapWorkspaceValues(
              workspaceId,
              values,
              context,
            )) as ObjectLiteral,
          )
          .returning(['id'])
          .execute();
        return {
          affected: result.generatedMaps.length,
          generatedMaps: result.generatedMaps,
          raw: result.generatedMaps,
        };
      },
    );
  }

  delete(workspaceId: string, where: FindOptionsWhere<TRecord>) {
    return this.run(
      workspaceId,
      (repository) => repository.delete(workspaceId, where),
      async (repository, context) => {
        const mappedWhere = await this.mapWorkspaceWhere(
          workspaceId,
          where,
          context,
        );
        if (mappedWhere === null) {
          return { affected: 0, generatedMaps: [], raw: [] };
        }
        const result = await repository
          .createQueryBuilder()
          .withDeleted()
          .where((mappedWhere ?? {}) as ObjectLiteral)
          .delete()
          .returning(['id'])
          .execute();
        return {
          affected: result.generatedMaps.length,
          generatedMaps: result.generatedMaps,
          raw: result.generatedMaps,
        };
      },
    );
  }

  upsert(
    workspaceId: string,
    values: QueryDeepPartialEntity<TRecord>,
    conflictPaths: string[],
  ) {
    return this.run(
      workspaceId,
      (repository) => repository.upsert(workspaceId, values, conflictPaths),
      async (repository, context) => {
        // Workspace upsert selects before inserting. Serialize concurrent stream
        // checkpoints for the same identity to preserve core ON CONFLICT behavior.
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
          (await this.mapWorkspaceValues(
            workspaceId,
            values,
            context,
          )) as ObjectLiteral,
          conflictPaths,
        );
      },
    );
  }

  query<TResult>(
    workspaceId: string,
    work: (context: AgentHistoryStorageContext) => Promise<TResult>,
  ): Promise<TResult> {
    return this.storageService.run(workspaceId, work);
  }
}
