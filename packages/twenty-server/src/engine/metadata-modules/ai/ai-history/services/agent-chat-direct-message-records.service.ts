import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AgentChatDirectMessageRecordsService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly privateRecordStorageService: PrivateRecordStorageService,
    private readonly recordShareStorageService: RecordShareStorageService,
  ) {}

  async share({
    workspaceId,
    transactionScope,
    threadId,
    objectName,
    recordIds,
  }: {
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
    threadId: string;
    objectName: AgentHistoryObjectName;
    recordIds: string[];
  }): Promise<boolean> {
    const thread = await transactionScope
      .getRepositoryWithoutPermissionChecks<AgentChatThreadWorkspaceEntity>(
        'agentChatThread',
      )
      .findOne({
        where: { id: threadId },
        select: [
          'id',
          'conversationType',
          'directMessageFirstWorkspaceMemberId',
          'directMessageSecondWorkspaceMemberId',
        ],
      });

    if (thread?.conversationType !== 'DIRECT_MESSAGE') {
      return false;
    }

    const {
      directMessageFirstWorkspaceMemberId,
      directMessageSecondWorkspaceMemberId,
    } = thread;

    if (
      !isDefined(directMessageFirstWorkspaceMemberId) ||
      !isDefined(directMessageSecondWorkspaceMemberId)
    ) {
      return throwAgentChatThreadNotFound();
    }

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS[objectName].universalIdentifier
      ] ?? throwAgentChatThreadNotFound();

    await this.privateRecordStorageService.setPrivate({
      workspaceId,
      flatObjectMetadata,
      recordIds,
      isPrivate: true,
      transactionScope,
    });
    await this.recordShareStorageService.insertMany({
      workspaceId,
      transactionScope,
      recordShares: recordIds.flatMap((recordId) =>
        [
          directMessageFirstWorkspaceMemberId,
          directMessageSecondWorkspaceMemberId,
        ].map((principalId) => ({
          objectMetadataId: flatObjectMetadata.id,
          recordId,
          principalId,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.READ_WRITE,
          rowCause: RecordShareRowCause.OWNER,
          sourceId: recordId,
        })),
      ),
    });

    return true;
  }
}
