import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { t } from '@lingui/core/macro';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  BadRequestException,
} from '@nestjs/common';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { normalizeAgentHistoryRecord } from 'src/engine/metadata-modules/ai/ai-history/utils/normalize-agent-history-record.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type RecordTarget = { objectMetadataId: string; recordId: string };
type ThreadTarget = RecordTarget & { threadId: string };
type TargetContext = {
  manager: EntityManager;
  threadTable: string;
  targetTable: string;
  targetColumn: string;
  workspaceId: string;
  userWorkspaceId: string;
};

@Injectable()
export class AgentChatThreadTargetService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly storageService: AgentHistoryStorageService,
  ) {}

  async attach(target: ThreadTarget): Promise<boolean> {
    return this.withReadableRecord(target, async (context) => {
      await this.lockOwnedThread(context, target.threadId);
      const { manager, targetTable, targetColumn } = context;
      // The thread lock serializes retries and links to custom targets, including those without a unique index.
      await manager.query(
        `INSERT INTO ${targetTable} ("threadId", ${targetColumn})
         SELECT $1, $2 WHERE NOT EXISTS (
           SELECT 1 FROM ${targetTable} WHERE "threadId" = $1 AND ${targetColumn} = $2 AND "deletedAt" IS NULL
         )`,
        [target.threadId, target.recordId],
      );
      return true;
    });
  }

  async detach(target: ThreadTarget): Promise<boolean> {
    return this.withReadableRecord(target, async (context) => {
      await this.lockOwnedThread(context, target.threadId);
      const { manager, targetTable, targetColumn } = context;
      await manager.query(
        `UPDATE ${targetTable} SET "deletedAt" = now(), "updatedAt" = now()
         WHERE "threadId" = $1 AND ${targetColumn} = $2 AND "deletedAt" IS NULL`,
        [target.threadId, target.recordId],
      );
      return true;
    });
  }

  async findForRecord(
    target: RecordTarget & { limit: number; offset: number },
  ): Promise<AgentChatThreadEntity[]> {
    if (
      !Number.isInteger(target.limit) ||
      target.limit < 1 ||
      target.limit > 100 ||
      !Number.isInteger(target.offset) ||
      target.offset < 0
    ) {
      throw new BadRequestException(
        t`Invalid pagination: limit must be between 1 and 100 and offset must be non-negative`,
      );
    }
    return this.withReadableRecord(
      target,
      async ({
        manager,
        threadTable,
        targetTable,
        targetColumn,
        workspaceId,
        userWorkspaceId,
      }) => {
        const threads = await manager.query<AgentChatThreadEntity[]>(
          `SELECT thread.* FROM ${threadTable} thread
         WHERE thread."userWorkspaceId" = $1 AND thread."deletedAt" IS NULL AND thread."archivedAt" IS NULL
         AND EXISTS (SELECT 1 FROM ${targetTable} target WHERE target."threadId" = thread.id AND target.${targetColumn} = $2 AND target."deletedAt" IS NULL)
         ORDER BY thread."updatedAt" DESC, thread.id DESC LIMIT $3 OFFSET $4`,
          [userWorkspaceId, target.recordId, target.limit, target.offset],
        );
        return threads.map(
          (record) =>
            normalizeAgentHistoryRecord({
              record,
              workspaceId,
              objectName: 'agentChatThread',
            }) as AgentChatThreadEntity,
        );
      },
    );
  }

  private async lockOwnedThread(
    { manager, threadTable, userWorkspaceId }: TargetContext,
    threadId: string,
  ): Promise<void> {
    const threads = await manager.query<{ id: string }[]>(
      `SELECT id FROM ${threadTable} WHERE id = $1 AND "userWorkspaceId" = $2 AND "deletedAt" IS NULL FOR UPDATE`,
      [threadId, userWorkspaceId],
    );
    if (threads.length === 0) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }
  }

  private async withReadableRecord<TResult>(
    target: RecordTarget,
    work: (context: TargetContext) => Promise<TResult>,
  ): Promise<TResult> {
    const authContext = getWorkspaceAuthContext();
    if (!isUserAuthContext(authContext)) {
      throw new ForbiddenException(
        t`A user is required to access conversation links`,
      );
    }
    const workspaceId = authContext.workspace.id;
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);
    const objectIdentifier =
      flatObjectMetadataMaps.universalIdentifierById[target.objectMetadataId];
    const objectMetadata = isDefined(objectIdentifier)
      ? flatObjectMetadataMaps.byUniversalIdentifier[objectIdentifier]
      : undefined;
    const targetField = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).find(
      (field) =>
        isDefined(field) &&
        field.isActive &&
        field.isSystemSideEffect &&
        field.objectMetadataUniversalIdentifier ===
          STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier &&
        field.type === FieldMetadataType.MORPH_RELATION &&
        field.morphId ===
          STANDARD_OBJECTS.agentChatThreadTarget.morphIds.targetMorphId
            .morphId &&
        field.relationTargetObjectMetadataId === target.objectMetadataId,
    );
    if (
      !isDefined(objectMetadata) ||
      !objectMetadata.isActive ||
      !isDefined(targetField) ||
      !isFlatFieldMetadataOfType(
        targetField,
        FieldMetadataType.MORPH_RELATION,
      ) ||
      !isDefined(targetField.settings?.joinColumnName)
    ) {
      throw new NotFoundException(
        t`This object does not support conversation links`,
      );
    }
    const targetColumn = escapeIdentifier(targetField.settings.joinColumnName);
    // Resolve permissions before taking the history fence, which reserves a core pool connection.
    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const record = await this.workspaceOrmManager
        .getRepository(objectMetadata.nameSingular)
        .findOne({ where: { id: target.recordId }, select: { id: true } });
      if (!isDefined(record)) throw new NotFoundException(t`Record not found`);
    }, authContext);
    return this.storageService.run(workspaceId, (context) => {
      if (context.storage !== 'workspace') {
        throw new ServiceUnavailableException(
          t`Conversation links require workspace history storage. Complete the history migration and retry.`,
        );
      }
      return work({
        manager: context.manager,
        threadTable: context.table('agentChatThread'),
        targetTable: `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."agentChatThreadTarget"`,
        targetColumn,
        workspaceId,
        userWorkspaceId: authContext.userWorkspaceId,
      });
    });
  }
}
