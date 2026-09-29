import { Injectable } from '@nestjs/common';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { findAgentChatThreadTargetJoinColumnName } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-thread-target-join-column-name.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { getObjectMetadataIdByName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-object-metadata-id-by-name.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const AGENT_CHAT_THREAD_TARGET_OBJECT_METADATA_NAME = 'agentChatThreadTarget';

type RecordReference = {
  objectNameSingular: string;
  recordId: string;
};

@Injectable()
export class AgentChatThreadTargetService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  // The link is written as the member, as the record API would write it. It
  // inherits its readability from the conversation, so the ORM refuses it
  // unless the member can edit that conversation. A chat turn runs in a queue
  // worker, outside the request that sent it, so it passes its sender's context.
  async attachThreadToRecord({
    workspaceId,
    threadId,
    objectNameSingular,
    recordId,
    authContext,
  }: RecordReference & {
    workspaceId: string;
    threadId: string;
    authContext: WorkspaceAuthContext;
  }): Promise<void> {
    const joinColumnName = await this.resolveJoinColumnNameOrThrow({
      workspaceId,
      objectNameSingular,
    });

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      // A record in the trash keeps its links, but nothing new is filed under it.
      await this.assertRecordIsReadableOrThrow({
        objectNameSingular,
        recordId,
      });

      const link = { threadId, [joinColumnName]: recordId };
      const repository =
        this.workspaceOrmManager.getRepositoryWithContextPermissions(
          AGENT_CHAT_THREAD_TARGET_OBJECT_METADATA_NAME,
        );

      // As on noteTarget, only the standard legs carry a unique index, so a
      // link to a custom object is deduplicated by looking for it first.
      if (await repository.existsBy(link)) {
        return;
      }

      await repository.insert(link, { onConflictDoNothing: true });
    }, authContext);
  }

  private async assertRecordIsReadableOrThrow({
    objectNameSingular,
    recordId,
  }: RecordReference): Promise<void> {
    const record = await this.workspaceOrmManager
      .getRepositoryWithContextPermissions(objectNameSingular)
      .findOne({ where: { id: recordId }, select: { id: true } })
      .catch((error: unknown) => {
        if (
          error instanceof PermissionsException &&
          error.code === PermissionsExceptionCode.PERMISSION_DENIED
        ) {
          return null;
        }

        throw error;
      });

    // Not-found rather than forbidden, so a member cannot probe for records
    // outside their grants.
    if (!isDefined(record)) {
      throw new AiException(
        'Record not found',
        AiExceptionCode.RECORD_NOT_FOUND,
      );
    }
  }

  private async resolveJoinColumnNameOrThrow({
    workspaceId,
    objectNameSingular,
  }: {
    workspaceId: string;
    objectNameSingular: string;
  }): Promise<string> {
    if (!isNonEmptyString(objectNameSingular)) {
      throw new AiException(
        'An object name is required to attach a conversation to a record',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const objectMetadataId = getObjectMetadataIdByName({
      flatObjectMetadataMaps,
      objectName: objectNameSingular,
    });

    if (!isDefined(objectMetadataId)) {
      throw new AiException(
        `Unknown object "${objectNameSingular}"`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    const joinColumnName = findAgentChatThreadTargetJoinColumnName({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectMetadataId,
    });

    if (!isDefined(joinColumnName)) {
      throw new AiException(
        `Conversations cannot be attached to ${objectNameSingular} records`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return joinColumnName;
  }
}
